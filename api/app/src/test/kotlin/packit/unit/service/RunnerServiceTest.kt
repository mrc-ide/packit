package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import packit.model.dto.OrderlyRunnerVersion
import packit.service.BaseRunnerService
import packit.service.OrderlyRunnerClient
import packit.service.OutpackServerClient
import kotlin.test.assertEquals

class RunnerServiceTest
{
    private val version = OrderlyRunnerVersion("test-version", "test-runner")
    private val orderlyRunnerClient =
        mock<OrderlyRunnerClient> {
            on { getVersion() } doReturn version
        }
    private val outpackServerClient = mock<OutpackServerClient>()

    @Test
    fun `can get version`()
    {
        val sut = BaseRunnerService(orderlyRunnerClient, outpackServerClient)
        val result = sut.getVersion()
        assertEquals(result, version)
    }

    @Test
    fun `can fetch git`()
    {
        val sut = BaseRunnerService(orderlyRunnerClient, outpackServerClient)
        sut.gitFetch()

        verify(outpackServerClient).gitFetch()
    }
}
