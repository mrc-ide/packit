package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import packit.model.dto.OrderlyRunnerVersion
import packit.service.BaseRunnerService
import packit.service.OrderlyRunnerClient
import kotlin.test.assertEquals

class RunnerServiceTest
{
    private val version = OrderlyRunnerVersion("test-version", "test-runner")
    private val orderlyRunnerClient =
        mock<OrderlyRunnerClient> {
            on { getVersion() } doReturn version
        }

    @Test
    fun `can get version`()
    {
        val sut = BaseRunnerService(orderlyRunnerClient)
        val result = sut.getVersion()
        assertEquals(result, version)
    }
}
