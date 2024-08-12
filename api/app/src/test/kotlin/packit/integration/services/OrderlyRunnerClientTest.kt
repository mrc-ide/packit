package packit.integration.services

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.service.OrderlyRunnerClient
import kotlin.test.assertEquals
import packit.model.dto.OrderlyRunnerVersion

class OrderlyRunnerClientTest : IntegrationTest()
{

    @Autowired
    lateinit var sut: OrderlyRunnerClient

    @Test
    fun `can get version`()
    {
        val result = sut.getVersion()
        assertEquals(
            OrderlyRunnerVersion("1.99.0", "0.1.0"),
            result
        )
    }
}
