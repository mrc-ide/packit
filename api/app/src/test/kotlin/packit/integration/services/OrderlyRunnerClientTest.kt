package packit.integration.services

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Value
import packit.config.RunnerConfig
import packit.config.RunnerRepository
import packit.integration.IntegrationTest
import packit.model.dto.OrderlyLocation
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunnerSubmitRunInfo
import packit.service.OrderlyRunnerClient
import kotlin.test.assertEquals
import kotlin.test.assertIs

class OrderlyRunnerClientTest(
    @Value("\${orderly.runner.url}")
    val runnerUrl: String,

    @Value("\${orderly.runner.repository.url}")
    val repositoryUrl: String,

    @Value("\${orderly.runner.repository.ssh-key}")
    val sshKey: String?,

    @Value("\${orderly.runner.location-url}")
    val locationUrl: String
) : IntegrationTest() {
    val repo: RunnerRepository = RunnerRepository(repositoryUrl, sshKey)
    val config: RunnerConfig = RunnerConfig(runnerUrl, locationUrl, repo)
    val sut: OrderlyRunnerClient = OrderlyRunnerClient(config)

    @BeforeEach
    fun fetch() {
        sut.gitFetch(repo)
    }

    @Test
    fun `can get version`() {
        val result = sut.getVersion()

        assertIs<OrderlyRunnerVersion>(result)
        assertIs<String>(result.orderly2)
        assertIs<String>(result.orderlyRunner)
    }

    @Test
    fun `can git fetch`() {
        val res = sut.gitFetch(repo)
        assertEquals(Unit, res)
    }

    @Test
    fun `can get git branches`() {
        val testBranchName = "master"
        val testBranchMessage = "initial commit\n"
        val gitBranches = sut.getBranches(repo)

        assertEquals(testBranchName, gitBranches.defaultBranch)
        assertEquals(testBranchName, gitBranches.branches[0].name)
        assertEquals(testBranchMessage, gitBranches.branches[0].message)
        assertEquals(Long::class.java, gitBranches.branches[0].time::class.java)
        assertEquals(String::class.java, gitBranches.branches[0].commitHash::class.java)
    }

    @Test
    fun `can get parameters`() {
        val testPacketGroupName = "parameters"
        val expectedParameters = listOf(
            Parameter("a", null),
            Parameter("b", 2),
            Parameter("c", null)
        )

        val result = sut.getParameters(repo, "HEAD", testPacketGroupName)

        assertEquals(expectedParameters, result)
    }

    @Test
    fun `can get packet groups`() {
        val runnerPacketGroups = sut.getPacketGroups(repo, "HEAD")

        runnerPacketGroups.forEach {
            assertEquals(String::class.java, it.name::class.java)
            assertEquals(Double::class.java, it.updatedTime::class.java)
            assertEquals(Boolean::class.java, it.hasModifications::class.java)
        }
    }

    @Test
    fun `can submit report run`() {
        val branchInfo = sut.getBranches(repo)
        val mainBranch = branchInfo.branches[0]
        val parameters = mapOf("a" to 1, "b" to 2)
        val submitInfo = RunnerSubmitRunInfo(
            sshKey = null,
            packetGroupName = "parameters",
            branch = mainBranch.name,
            commitHash = mainBranch.commitHash,
            parameters = parameters,
            location = OrderlyLocation.http(locationUrl)
        )
        val res = sut.submitRun(repo, submitInfo)

        assertEquals(String::class.java, res.taskId::class.java)
    }

    @Test
    fun `can get statuses of tasks`() {
//        run 2 tasks
        val branchInfo = sut.getBranches(repo)
        val mainBranch = branchInfo.branches[0]
        val parameters = mapOf("a" to 1, "b" to 2)
        val submitInfo = RunnerSubmitRunInfo(
            sshKey = null,
            packetGroupName = "parameters",
            branch = mainBranch.name,
            commitHash = mainBranch.commitHash,
            parameters = parameters,
            location = OrderlyLocation.http(locationUrl)
        )
        val res1 = sut.submitRun(repo, submitInfo)
        val res2 = sut.submitRun(repo, submitInfo)

        val taskIds = listOf(res1.taskId, res2.taskId)

        val statuses = sut.getTaskStatuses(taskIds, false).statuses

        statuses.forEach {
            assertEquals(String::class.java, it.taskId::class.java)
            assertEquals(String::class.java, it.status::class.java)
        }
    }

    @Test
    fun `can cancel task`() {
        val branchInfo = sut.getBranches(repo)
        val mainBranch = branchInfo.branches[0]
        val submitInfo = RunnerSubmitRunInfo(
            sshKey = null,
            packetGroupName = "t2",
            branch = mainBranch.name,
            commitHash = mainBranch.commitHash,
            parameters = emptyMap(),
            location = OrderlyLocation.http(locationUrl)
        )
        val res = sut.submitRun(repo, submitInfo)

        sut.cancelTask(res.taskId)

        val statuses = sut.getTaskStatuses(listOf(res.taskId), false).statuses
        assertEquals("CANCELLED", statuses[0].status)
    }
}
