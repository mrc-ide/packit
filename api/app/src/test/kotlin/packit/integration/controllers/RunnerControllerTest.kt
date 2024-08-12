package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.http.ResponseEntity
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.*
import packit.integration.IntegrationTest
import packit.model.dto.OrderlyRunnerVersion
import kotlin.test.assertEquals

class RunnerControllerTest : IntegrationTest()
{
    @Test
    fun `can get orderly runner version`()
    {
        val res: ResponseEntity<OrderlyRunnerVersion> = restTemplate.exchange(
            "/runner/version",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(
            OrderlyRunnerVersion("1.99.0", "0.1.0"),
            res.body
        )
    }
}
