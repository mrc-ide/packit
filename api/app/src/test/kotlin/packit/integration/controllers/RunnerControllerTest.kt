package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.http.ResponseEntity
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.*
import packit.integration.IntegrationTest
import packit.model.dto.OrderlyRunnerVersion
import packit.integration.WithAuthenticatedUser
import kotlin.test.assertEquals

class RunnerControllerTest : IntegrationTest()
{
    @Test
    @WithAuthenticatedUser(authorities = ["none"])
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
}
