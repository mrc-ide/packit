package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.dto.*
import packit.repository.RunInfoRepository
import kotlin.test.assertEquals

class RunnerControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var runInfoRepository: RunInfoRepository
    val testPacketGroupName = "test-packetGroupName"
    private fun getSubmitRunInfo(branch: String, commitHash: String): String
    {
        return jacksonObjectMapper().writeValueAsString(SubmitRunInfo(testPacketGroupName, branch, commitHash, null))
    }

    private fun submitTestRun(): Pair<String, GitBranchInfo>
    {
        val branchRes: ResponseEntity<GitBranches> = restTemplate.exchange(
            "/runner/git/branches",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        val branch = branchRes.body!!.branches[0]

        val res: ResponseEntity<SubmitRunResponse> = restTemplate.exchange(
            "/runner/run",
            HttpMethod.POST,
            getTokenizedHttpEntity(
                MediaType.APPLICATION_JSON,
                getSubmitRunInfo(branch.name, branch.commitHash)
            )
        )

        return Pair(res.body!!.taskId, branch)
    }

    @AfterEach
    fun cleanupData()
    {
        runInfoRepository.deleteAllByPacketGroupName(testPacketGroupName)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get orderly runner version`()
    {
        val res: ResponseEntity<OrderlyRunnerVersion> = restTemplate.exchange(
            "/runner/version",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertThat(res.body).isInstanceOf(OrderlyRunnerVersion::class.java)
        assertThat(res.body!!.orderly2).isInstanceOf(String::class.java)
        assertThat(res.body!!.orderlyRunner).isInstanceOf(String::class.java)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `gets unauthorized if no packet run authority`()
    {
        val res: ResponseEntity<OrderlyRunnerVersion> = restTemplate.getForEntity(
            "/runner/version",
            OrderlyRunnerVersion::class.java
        )

        assertEquals(HttpStatus.UNAUTHORIZED, res.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can fetch git`()
    {
        val res: ResponseEntity<Unit> = restTemplate.exchange(
            "/runner/git/fetch",
            HttpMethod.POST,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.NO_CONTENT, res.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get git branches`()
    {
        val testBranchName = "master"
        val testBranchMessages = listOf("first commit")
        val res: ResponseEntity<GitBranches> = restTemplate.exchange(
            "/runner/git/branches",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        val resBody = res.body!!

        assertEquals(testBranchName, resBody.defaultBranch)
        assertEquals(testBranchName, resBody.branches[0].name)
        assertEquals(testBranchMessages, resBody.branches[0].message)
        assertEquals(Long::class.java, resBody.branches[0].time::class.java)
        assertEquals(String::class.java, resBody.branches[0].commitHash::class.java)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get parameters`()
    {
        val testPacketGroupName = "parameters"
        val expectedParameters = listOf(
            Parameter("a", null),
            Parameter("b", 2),
            Parameter("c", null),
        )
        val res: ResponseEntity<List<Parameter>> = restTemplate.exchange(
            "/runner/$testPacketGroupName/parameters?ref=master",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(expectedParameters, res.body)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get list of packetGroups`()
    {
        val res: ResponseEntity<List<RunnerPacketGroup>> = restTemplate.exchange(
            "/runner/packetGroups?ref=master",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        res.body!!.forEach {
            assertEquals(String::class.java, it.name::class.java)
            assertEquals(Double::class.java, it.updatedTime::class.java)
            assertEquals(Boolean::class.java, it.hasModifications::class.java)
        }
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can submit report run`()
    {
        val (taskId) = submitTestRun()

        assertEquals(String::class.java, taskId::class.java)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get status of single task`()
    {
        val (taskId, branch) = submitTestRun()
        val statusRes: ResponseEntity<RunInfoDto> = restTemplate.exchange(
            "/runner/status/$taskId",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(taskId, statusRes.body!!.taskId)
        assertEquals(branch.name, statusRes.body!!.branch)
        assertEquals(branch.commitHash, statusRes.body!!.commitHash)
        assertEquals("test.user@example.com", statusRes.body!!.username)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get paginated status of multiple tasks`()
    {
        val (taskId1, branch1) = submitTestRun()
        val (taskId2, branch2) = submitTestRun()
        val pageNumber = 0
        val pageSize = 100
        val filterPacketGroupName = testPacketGroupName

        val res = restTemplate.exchange(
            "/runner/list/status?pageNumber=$pageNumber&pageSize=$pageSize&filterPacketGroupName=$filterPacketGroupName",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            String::class.java
        )
        assertSuccess(res)

        val resultStatuses = jacksonObjectMapper().readTree(res.body).get("content")
            .let {
                jacksonObjectMapper().convertValue(
                    it,
                    object : TypeReference<List<BasicRunInfoDto>>()
                    {}
                )
            }

        assertEquals(2, resultStatuses.size)
        resultStatuses.forEach {
            assertEquals(testPacketGroupName, it.packetGroupName)
            assertEquals("test.user@example.com", it.username)
        }
        assertEquals(taskId1, resultStatuses[0].taskId)
        assertEquals(branch1.name, resultStatuses[0].branch)
        assertEquals(taskId2, resultStatuses[1].taskId)
        assertEquals(branch2.name, resultStatuses[1].branch)
    }
}
