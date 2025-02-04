package packit.integration.controllers
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.awaitility.Awaitility.await
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.test.context.TestPropertySource
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.User
import packit.model.dto.*
import packit.repository.RunInfoRepository
import packit.repository.UserRepository
import java.time.Duration
import kotlin.test.assertEquals

class RunnerControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var runInfoRepository: RunInfoRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    private val testPacketGroupName = "incoming_data"
    private val testUser = User("test.user@example.com", mutableListOf(), false, "source1", "Test User")

    private fun getSubmitRunInfo(branch: String, commitHash: String): SubmitRunInfo
    {
        return SubmitRunInfo(testPacketGroupName, branch, commitHash, emptyMap())
    }

    private fun submitTestRun(): Pair<String, GitBranchInfo>
    {
        val fetchRes: ResponseEntity<Unit> = restTemplate.exchange(
            "/runner/git/fetch",
            HttpMethod.POST,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.NO_CONTENT, fetchRes.statusCode)

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

    private fun waitForTask(taskId: String, timeout: Duration = Duration.ofSeconds(10)): RunInfoDto {
        val res: ResponseEntity<RunInfoDto> = await().atMost(timeout).pollInSameThread().until({
            restTemplate.exchange(
                "/runner/status/$taskId",
                HttpMethod.GET,
                getTokenizedHttpEntity()
            )
        }, { it.body?.status != Status.PENDING && it.body?.status != Status.RUNNING })

        assertSuccess(res)

        return res.body!!
    }

    @BeforeEach
    fun setupData()
    {
        userRepository.save(testUser)
    }

    @AfterEach
    fun cleanupData()
    {
        runInfoRepository.deleteAllByPacketGroupName(testPacketGroupName)
        userRepository.delete(testUser)
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
        val testBranchMessage = "initial commit\n"
        val res: ResponseEntity<GitBranches> = restTemplate.exchange(
            "/runner/git/branches",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        val resBody = res.body!!

        assertEquals(testBranchName, resBody.defaultBranch)
        assertEquals(testBranchName, resBody.branches[0].name)
        assertEquals(testBranchMessage, resBody.branches[0].message)
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
        assertEquals(testUser.displayName, statusRes.body!!.runBy)
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
            "/runner/list/status?pageNumber=$pageNumber&pageSize=" +
                    "$pageSize&filterPacketGroupName=$filterPacketGroupName",
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
            assertEquals(testUser.displayName, it.runBy)
        }
        assertEquals(taskId1, resultStatuses[0].taskId)
        assertEquals(branch1.name, resultStatuses[0].branch)
        assertEquals(taskId2, resultStatuses[1].taskId)
        assertEquals(branch2.name, resultStatuses[1].branch)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get logs of run`()
    {
        val (taskId) = submitTestRun()

        val info = waitForTask(taskId)
        assertEquals(taskId, info.taskId)
        assertEquals(Status.COMPLETE, info.status)

        assertThat(info.logs).anySatisfy({
            assertThat(it).contains("Starting packet 'incoming_data'")
        })
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run", "outpack.read"])
    fun `packet produced by runner is pushed to outpack`()
    {
        val (taskId) = submitTestRun()

        val info = waitForTask(taskId)
        assertEquals(taskId, info.taskId)
        assertEquals(Status.COMPLETE, info.status)

        val res: ResponseEntity<String> = restTemplate.exchange(
            "/outpack/metadata/${info.packetId!!}/text",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.OK, res.statusCode)
        assertEquals(testPacketGroupName, jacksonObjectMapper().readTree(res.body).get("name").asText())
    }
}

@TestPropertySource(properties = ["orderly.runner.repository.url=http://example.com"])
class UnknownRepoRunnerControllerTest : IntegrationTest()
{
    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `git branches of unknown repo is empty`()
    {
        val res: ResponseEntity<GitBranches> = restTemplate.exchange(
            "/runner/git/branches",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(res)
        assertEquals(0, res.body!!.branches.size)
        assertEquals(null, res.body!!.defaultBranch)
    }
}

@TestPropertySource(properties = ["orderly.runner.enabled=false"])
class DisabledRunnerControllerTest : IntegrationTest()
{
    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `cannot get orderly runner version`()
    {
        val res: ResponseEntity<JsonNode> = restTemplate.exchange(
            "/runner/version",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertForbidden(res)

        val error = res.body!!.required("error").required("detail").asText()
        assertEquals("Orderly runner is not enabled", error)
    }
}
