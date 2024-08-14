package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.dto.GitBranchInfo
import packit.model.dto.OrderlyRunnerVersion
import kotlin.test.assertContains
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
        val res: ResponseEntity<List<GitBranchInfo>> = restTemplate.exchange(
            "/runner/git/branches",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        
        res.body?.let {
            assertContains(
                it,
                GitBranchInfo(
                    "master",
                    "34bb6b7f38139420b029f28ace8e5c9f46145c0d",
                    1723627545,
                    listOf("first commit")
                )
            )
        }
    }
}
