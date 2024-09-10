package packit.unit.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.`when`
import org.mockito.kotlin.argThat
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.RunInfo
import packit.model.dto.*
import packit.repository.RunInfoRepository
import packit.service.BaseRunnerService
import packit.service.OrderlyRunnerClient
import packit.service.OutpackServerClient
import kotlin.test.assertEquals

class RunnerServiceTest
{
    private val version = OrderlyRunnerVersion("test-version", "test-runner")
    private val orderlyRunnerClient =
        mock<OrderlyRunnerClient> {
            on { getVersion() } doReturn version
        }
    private val outpackServerClient = mock<OutpackServerClient>()
    private val runInfoRepository = mock<RunInfoRepository>()

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
        val mockRes = SubmitRunResponse("task-id")

        `when`(orderlyRunnerClient.submitRun(info)).thenReturn(mockRes)

        val runInfo = RunInfo(
            mockRes.taskId,
            packetGroupName = info.packetGroupName,
            commitHash = info.commitHash,
            branch = info.branch,
            parameters = info.parameters,
            status = Status.PENDING.toString()
        )
        val res = sut.submitRun(info)

        verify(orderlyRunnerClient).submitRun(info)
        verify(runInfoRepository).save(argThat { this.taskId == runInfo.taskId })
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
            status = Status.PENDING.toString()
        )
        `when`(orderlyRunnerClient.getTaskStatuses(listOf(taskId), true)).thenReturn(listOf(taskStatus))
        `when`(runInfoRepository.findByTaskId(taskId)).thenReturn(testRunInfo)

        val result = sut.getTaskStatus(taskId)

        verify(orderlyRunnerClient).getTaskStatuses(listOf(taskId), true)
        verify(runInfoRepository).save(argThat {
            assertEquals(taskId, this.taskId)
            assertEquals(taskStatus.timeQueued, this.timeQueued)
            assertEquals(taskStatus.timeStarted, this.timeStarted)
            assertEquals(taskStatus.timeComplete, this.timeCompleted)
            assertEquals(taskStatus.logs, this.logs)
            assertEquals(taskStatus.status, this.status)
            true
        })
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
    fun `can get statuses of tasks without logs`()
    {
        val taskIds = listOf("task-id1", "task-id2")
        val taskStatuses = listOf(
            TaskStatus(0.0, 1.0, 2.0, 0, listOf("log1", "log2"), "status", "packet-id", "task-id1"),
            TaskStatus(0.0, 1.0, 2.0, 0, listOf("log1", "log2"), "status", "packet-id", "task-id2")
        )
        val testRunInfos = listOf(
            RunInfo(
                "task-id1",
                packetGroupName = "packet-group",
                commitHash = "hash",
                branch = "branch",
                parameters = null,
                status = Status.PENDING.toString()
            ),
            RunInfo(
                "task-id2",
                packetGroupName = "packet-group",
                commitHash = "hash",
                branch = "branch",
                parameters = null,
                status = Status.PENDING.toString()
            )
        )
        `when`(runInfoRepository.findAll()).thenReturn(testRunInfos)
        `when`(orderlyRunnerClient.getTaskStatuses(taskIds, false)).thenReturn(taskStatuses)

        val result = sut.getTasksStatuses()

        verify(orderlyRunnerClient).getTaskStatuses(taskIds, false)
        verify(runInfoRepository).saveAll<RunInfo>(argThat {
            this.forEachIndexed { index, runInfo ->
                assertEquals(taskStatuses[index].timeQueued, runInfo.timeQueued)
                assertEquals(taskStatuses[index].timeStarted, runInfo.timeStarted)
                assertEquals(taskStatuses[index].timeComplete, runInfo.timeCompleted)
                assertEquals(taskStatuses[index].logs, runInfo.logs)
                assertEquals(taskStatuses[index].status, runInfo.status)
            }
            true
        })
        assertThat(result).isInstanceOf(List::class.java)
    }
}
