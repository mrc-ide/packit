package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import kotlin.test.assertEquals

class RunnerControllerTest : IntegrationTest()
{
    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get orderly runner version`()
    {
        val res: ResponseEntity<OrderlyRunnerVersion> = restTemplate.exchange(
            "/runner/version",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(
            OrderlyRunnerVersion("1.99.25", "0.1.0"),
            res.body
        )
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

        assertEquals(testBranchName, resBody.defaultBranch.name)
        assertEquals(testBranchMessages, resBody.defaultBranch.message)
        assertEquals(Long::class.java, resBody.defaultBranch.time::class.java)
        assertEquals(String::class.java, resBody.defaultBranch.commitHash::class.java)
        assertEquals(testBranchName, resBody.branches[0].name)
        assertEquals(testBranchMessages, resBody.branches[0].message)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.run"])
    fun `can get parameters`()
    {
        val testPacketGroupName = "parameters"
        val expectedParameters = listOf(
            Parameter("a", null),
            Parameter("b", "2"),
            Parameter("c", null)
        )
        val res: ResponseEntity<List<Parameter>> = restTemplate.exchange(
            "/runner/$testPacketGroupName/parameters?ref=master",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(expectedParameters, res.body)
    }
}
