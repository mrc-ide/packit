package packit.integration.services

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.AppConfig
import packit.service.OutpackServerClient

class OutpackServerClientTest
{

    private val mockConfig = mock<AppConfig> {
        on { outpackServerUrl } doReturn "http://localhost:8000"
    }

    @Test
    fun `can get checksum`()
    {
        val sut = OutpackServerClient(mockConfig)
        val result = sut.getChecksum()
        assert(result.startsWith("sha256"))
    }

    @Test
    fun `can get metadata`()
    {
        val sut = OutpackServerClient(mockConfig)
        val result = sut.getMetadata()
        assert(result.map { it.name }.containsAll(listOf("parameters", "explicit", "depends", "computed-resource")))
    }
}
