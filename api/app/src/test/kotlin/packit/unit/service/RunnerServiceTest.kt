package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.kotlin.*
import packit.model.RunInfo
import packit.model.dto.Status
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunnerPacketGroup
import packit.model.dto.SubmitRunInfo
import packit.model.dto.SubmitRunResponse
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
        assertEquals(res, "task-id")
    }
}
