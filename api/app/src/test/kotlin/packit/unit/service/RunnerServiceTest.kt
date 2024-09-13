package packit.unit.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.`when`
import org.mockito.kotlin.*
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.PageablePayload
import packit.model.RunInfo
import packit.model.dto.*
import packit.repository.RunInfoRepository
import packit.service.BaseRunnerService
import packit.service.OrderlyRunnerClient
import packit.service.OutpackServerClient
import kotlin.test.assertEquals

class RunnerServiceTest
{
    private val filterName = "filter-name"
    private val testRunInfos = listOf(
        RunInfo(
            "task-id1",
            packetGroupName = "packet-group",
            commitHash = "hash",
            branch = "branch",
            parameters = null,
            status = Status.PENDING.toString(),
            username = "test-user"
        ),
        RunInfo(
            "task-id2",
            packetGroupName = "packet-group",
            commitHash = "hash",
            branch = "branch",
            parameters = null,
            status = Status.PENDING.toString(),
            username = "test-user"
        )
    )
    private val testTaskStatuses = listOf(
        TaskStatus(0.0, 1.0, 2.0, 0, listOf("log1", "log2"), "status", "packet-id", "task-id1"),
        TaskStatus(0.0, 1.0, 2.0, 0, listOf("log1", "log2"), "status", "packet-id", "task-id2")
    )

    private val version = OrderlyRunnerVersion("test-version", "test-runner")
    private val orderlyRunnerClient =
        mock<OrderlyRunnerClient> {
            on { getVersion() } doReturn version
        }
    private val outpackServerClient = mock<OutpackServerClient>()
    private val runInfoRepository = mock<RunInfoRepository> {
        on { findAllByPacketGroupNameContaining(eq(filterName), any()) } doReturn PageImpl(testRunInfos)
    }

    private val sut = BaseRunnerService(orderlyRunnerClient, outpackServerClient, runInfoRepository)

    @Test
    fun `can get version`()
    {
        val result = sut.getVersion()
        assertEquals(result, version)
    }

    @Test
    fun `can fetch git`()
    {
        sut.gitFetch()

        verify(outpackServerClient).gitFetch()
    }

    @Test
    fun `can get branches`()
    {
        sut.getBranches()

        verify(outpackServerClient).getBranches()
    }

    @Test
    fun `can get parameters`()
    {
        val packetGroupName = "test-packet-group"
        val ref = "commit-name"
        val testParameters = listOf(
            Parameter("test-name", "test-value")
        )
        `when`(orderlyRunnerClient.getParameters(packetGroupName, ref)).thenReturn(testParameters)

        val parameters = sut.getParameters(packetGroupName, ref)

        verify(orderlyRunnerClient).getParameters(packetGroupName, ref)
        assertEquals(testParameters, parameters)
    }

    @Test
    fun `can get packet groups for ref`()
    {
        val testRunnerPacketGroups = listOf(
            RunnerPacketGroup("test-group", 0.0, true),
            RunnerPacketGroup("test-group", 1.0, false)
        )
        val ref = "branch-name"
        `when`(orderlyRunnerClient.getPacketGroups(ref)).thenReturn(testRunnerPacketGroups)

        val packetGroups = sut.getPacketGroups(ref)

        verify(orderlyRunnerClient).getPacketGroups(ref)
        assertEquals(testRunnerPacketGroups, packetGroups)
    }

    @Test
    fun `can submit run`()
    {

        val info = SubmitRunInfo("report-name", "branch", "hash", null)
        val testUsername = "test-user"
        val mockRes = SubmitRunResponse("task-id")

        `when`(orderlyRunnerClient.submitRun(info)).thenReturn(mockRes)

        val res = sut.submitRun(info, testUsername)

        verify(orderlyRunnerClient).submitRun(info)
        verify(runInfoRepository).save(argThat {
            assertEquals(taskId, mockRes.taskId)
            assertEquals(packetGroupName, info.packetGroupName)
            assertEquals(commitHash, info.commitHash)
            assertEquals(branch, info.branch)
            assertEquals(parameters, info.parameters)
            assertEquals(status, Status.PENDING.toString())
            assertEquals(username, testUsername)
            true
        })
        assertEquals(res.taskId, "task-id")
    }

    @Test
    fun `can get task status with logs & updates run info of single task`()
    {
        val taskId = "task-id"
        val taskStatus = TaskStatus(0.0, 1.0, 2.0, 0, listOf("log1", "log2"), "status", "packet-id", taskId)
        val testRunInfo = RunInfo(
            taskId,
            packetGroupName = "packet-group",
            commitHash = "hash",
            branch = "branch",
            parameters = null,
            status = Status.PENDING.toString(),
            username = "test-user"
        )
        `when`(orderlyRunnerClient.getTaskStatuses(listOf(taskId), true)).thenReturn(listOf(taskStatus))
        `when`(runInfoRepository.findByTaskId(taskId)).thenReturn(testRunInfo)

        val result = sut.getTaskStatus(taskId)

        verify(orderlyRunnerClient).getTaskStatuses(listOf(taskId), true)
        verify(runInfoRepository).save(
            argThat {
                assertEquals(taskId, this.taskId)
                assertEquals(taskStatus.timeQueued, this.timeQueued)
                assertEquals(taskStatus.timeStarted, this.timeStarted)
                assertEquals(taskStatus.timeComplete, this.timeCompleted)
                assertEquals(taskStatus.logs, this.logs)
                assertEquals(taskStatus.status, this.status)
                true
            }
        )
        assertThat(result).isInstanceOf(RunInfo::class.java)
    }

    @Test
    fun `throws exception when run info not found for taskId`()
    {
        val taskId = "task-id"
        `when`(runInfoRepository.findByTaskId(taskId)).thenReturn(null)

        assertThrows<PackitException> { sut.getTaskStatus(taskId) }.apply {
            assertEquals("runInfoNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
    }

    @Test
    fun `can get run infos from db`()
    {
        val filterName = "filter-name"
        val payload = PageablePayload(pageNumber = 0, pageSize = 10)

        val result = sut.getRunInfos(payload, filterName)

        verify(runInfoRepository).findAllByPacketGroupNameContaining(
            filterName,
            PageRequest.of(
                payload.pageNumber,
                payload.pageSize,
                Sort.by("timeQueued")
                    .descending() // NULL values sorted first (newest as have not had status called on them yet)
            )
        )
        assertEquals(2, result.size)
        assertEquals(testRunInfos, result.content)
    }

    @Test
    fun `can get paginated statuses of tasks without logs`()
    {
        val taskIds = listOf("task-id1", "task-id2")
        val filterName = "filter-name"
        val payload = PageablePayload(pageNumber = 0, pageSize = 10)
        `when`(orderlyRunnerClient.getTaskStatuses(taskIds, false)).thenReturn(testTaskStatuses)

        val result = sut.getTasksStatuses(payload, filterName)

        verify(orderlyRunnerClient).getTaskStatuses(taskIds, false)
        assertEquals(2, result.size)
        assertEquals(testRunInfos, result.content)
    }

    @Test
    fun `returns empty page if no run infos found`()
    {
        val payload = PageablePayload(pageNumber = 0, pageSize = 10)
        `when`(
            runInfoRepository.findAllByPacketGroupNameContaining(
                filterName,
                PageRequest.of(payload.pageNumber, payload.pageSize, Sort.by("timeQueued").descending())
            )
        ).thenReturn(PageImpl(emptyList()))


        val result = sut.getRunInfos(payload, filterName)

        assertEquals(0, result.size)
    }

    @Test
    fun `updateRunInfosWithStatuses should update run infos with statuses`()
    {
        val updatedRunInfos = sut.updateRunInfosWithStatuses(PageImpl(testRunInfos), testTaskStatuses)

        assertEquals(2, updatedRunInfos.size)
        updatedRunInfos.forEachIndexed { index, runInfo ->
            assertEquals(testTaskStatuses[index].timeQueued, runInfo.timeQueued)
            assertEquals(testTaskStatuses[index].timeStarted, runInfo.timeStarted)
            assertEquals(testTaskStatuses[index].timeComplete, runInfo.timeCompleted)
            assertEquals(testTaskStatuses[index].logs, runInfo.logs)
            assertEquals(testTaskStatuses[index].status, runInfo.status)
        }
    }

    @Test
    fun `updateRunInfosWithStatuses throws unable to find taskId in statuses recieved`()
    {
        val taskStatuses = listOf(
            TaskStatus(0.0, 1.0, 2.0, 0, listOf("log1", "log2"), "status", "packet-id", "task-id1")
        )

        assertThrows<PackitException> {
            sut.updateRunInfosWithStatuses(PageImpl(testRunInfos), taskStatuses)
        }.apply {
            assertEquals("runInfoNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
    }

    @Test
    fun `should update run info when no task status logs`()
    {
        val taskStatus = TaskStatus(0.0, 1.0, 2.0, 0, null, "status", "packet-id", "task-id")

        val updatedRunInfo = sut.updateRunInfo(testRunInfos[0], taskStatus)

        assertEquals(taskStatus.timeQueued, updatedRunInfo.timeQueued)
        assertEquals(taskStatus.timeStarted, updatedRunInfo.timeStarted)
        assertEquals(taskStatus.timeComplete, updatedRunInfo.timeCompleted)
        assertEquals(taskStatus.status, updatedRunInfo.status)
        assertEquals(taskStatus.packetId, updatedRunInfo.packetId)
        assertEquals(taskStatus.queuePosition, updatedRunInfo.queuePosition)
        assertEquals(testRunInfos[0].logs, updatedRunInfo.logs)
    }

    @Test
    fun `should update run info when task status has logs`()
    {
        val taskStatus = TaskStatus(0.0, 1.0, 2.0, 0, listOf("log1", "log2"), "status", "packet-id", "task-id")

        val updatedRunInfo = sut.updateRunInfo(testRunInfos[0], taskStatus)

        assertEquals(taskStatus.timeQueued, updatedRunInfo.timeQueued)
        assertEquals(taskStatus.timeStarted, updatedRunInfo.timeStarted)
        assertEquals(taskStatus.timeComplete, updatedRunInfo.timeCompleted)
        assertEquals(taskStatus.logs, updatedRunInfo.logs)
        assertEquals(taskStatus.status, updatedRunInfo.status)
        assertEquals(taskStatus.packetId, updatedRunInfo.packetId)
        assertEquals(taskStatus.queuePosition, updatedRunInfo.queuePosition)
    }
}
