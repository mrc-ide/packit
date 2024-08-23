package packit.integration.controllers

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunnerPacketGroup
import packit.repository.RunInfoRepository
import kotlin.test.assertEquals

class RunnerControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var runInfoRepository: RunInfoRepository

    private fun getSubmitRunInfo(branch: String, commitHash: String): String
    {
        return "{\n" +
        "  \"name\": \"data\",\n" +
        "  \"branch\": \"$branch\",\n" +
        "  \"hash\": \"$commitHash\"\n" +
        "}"
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
        val branchRes: ResponseEntity<GitBranches> = restTemplate.exchange(
            "/runner/git/branches",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        val branch = branchRes.body!!.branches[0]

        val res: ResponseEntity<String> = restTemplate.exchange(
            "/runner/run",
            HttpMethod.POST,
            getTokenizedHttpEntity(
                MediaType.APPLICATION_JSON,
                getSubmitRunInfo(branch.name, branch.commitHash)
            )
        )

        assertEquals(String::class.java, res.body!!::class.java)
    }
}
