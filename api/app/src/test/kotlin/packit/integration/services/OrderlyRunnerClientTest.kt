package packit.integration.services

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.model.dto.OrderlyRunnerVersion
import packit.service.OrderlyRunnerClient
import kotlin.test.assertContains

class OrderlyRunnerClientTest : IntegrationTest() {

    @Autowired lateinit var sut: OrderlyRunnerClient

    @Test
    fun `can get version`() {
        val result = sut.getVersion()
        assertContains(result.orderly2, "1.99")
        assertContains(result.orderlyRunner, "0.1")
    }
}
