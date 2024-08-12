package packit.unit.service

import org.mockito.kotlin.*
import packit.service.OrderlyRunnerClient
import packit.service.BaseRunnerService
import packit.model.dto.OrderlyRunnerVersion
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class RunnerServiceTest
{
    private val version = OrderlyRunnerVersion("test-version", "test-runner")
    private val orderlyRunnerClient =
        mock<OrderlyRunnerClient> {
            on { getVersion() } do doReturn(version)
        }

    @Test
    fun `can get version`()
    {
        val sut = BaseRunnerService(orderlyRunnerClient)
        val result = sut.getVersion()
        assertEquals(result, version)
    }
}
