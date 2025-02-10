package packit.integration.services

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.service.OutpackServerClient
import java.io.ByteArrayOutputStream

class OutpackServerClientTest : IntegrationTest()
{

    @Autowired
    lateinit var sut: OutpackServerClient

    @Test
    fun `can get checksum`()
    {
        val result = sut.getChecksum()
        assert(result.startsWith("sha256"))
    }

    @Test
    fun `can get metadata`()
    {
        val result = sut.getMetadata()
        assert(result.map { it.name }.containsAll(listOf("parameters", "explicit", "depends", "computed-resource")))
    }

    @Test
    fun `can write the input stream from a get response to an output stream`()
    {
        val hash = "sha256:1a1b649d911106d45dcb58e535aae97904f465e66b11a38d7a70828b53e3a2eb"
        val outputStream = ByteArrayOutputStream()

        sut.getFileByHash(hash, outputStream)

        val result = outputStream.toString("UTF-8")
        assert(result.contains("files <- dir(pattern = \"*.csv\")\n"))
    }
}
