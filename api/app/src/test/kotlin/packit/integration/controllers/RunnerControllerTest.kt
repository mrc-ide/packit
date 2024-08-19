package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.*
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.dto.OrderlyRunnerVersion
import kotlin.test.assertContains

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
        assertContains(res.body!!.orderly2, "1.99")
        assertContains(res.body!!.orderlyRunner, "0.1")
    }
}
