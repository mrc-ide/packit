package packit.integration.services

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.service.OrderlyRunnerClient
import kotlin.test.assertEquals
import kotlin.test.assertIs

class OrderlyRunnerClientTest : IntegrationTest()
{

    @Autowired
    lateinit var sut: OrderlyRunnerClient

    @Test
    fun `can get version`()
    {
        val result = sut.getVersion()

        assertIs<OrderlyRunnerVersion>(result)
        assertIs<String>(result.orderly2)
        assertIs<String>(result.orderlyRunner)
    }

    @Test
    fun `can get parameters`()
    {
        val testPacketGroupName = "parameters"
        val expectedParameters = listOf(
            Parameter("a", null),
            Parameter("b", 2),
            Parameter("c", null)
        )

        val result = sut.getParameters(testPacketGroupName, "HEAD")

        assertEquals(expectedParameters, result)
    }

    @Test
    fun `can get packet groups`()
    {
        val runnerPacketGroups = sut.getPacketGroups("HEAD")

        runnerPacketGroups.forEach {
            assertEquals(String::class.java, it.name::class.java)
            assertEquals(Double::class.java, it.updatedTime::class.java)
            assertEquals(Boolean::class.java, it.hasModifications::class.java)
        }
    }
}
