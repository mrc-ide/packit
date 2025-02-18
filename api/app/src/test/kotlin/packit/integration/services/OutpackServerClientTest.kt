package packit.integration.services

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.integration.IntegrationTest
import packit.service.OutpackServerClient
import java.io.ByteArrayOutputStream
import kotlin.test.assertEquals

class OutpackServerClientTest : IntegrationTest()
{

    @Autowired
    lateinit var sut: OutpackServerClient

    // Hash of computed-resource/orderly.R
    private val hash = "sha256:1a1b649d911106d45dcb58e535aae97904f465e66b11a38d7a70828b53e3a2eb"

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
    fun `can write the input stream from a response to an output stream, and consume response headers`()
    {
        val outputStream = ByteArrayOutputStream()
        var headerHolder = ""

        sut.getFileByHash(hash, outputStream) { outpackResponseHeaders ->
            headerHolder = outpackResponseHeaders.contentType.toString()
        }

        val result = outputStream.toString("UTF-8")
        assertThat(result).contains("files <- dir(pattern = \"*.csv\")\n")
        assertThat(headerHolder).isEqualTo("application/octet-stream")
    }

    @Test
    fun `getFileByHash throws a PackitException with 'not found' when the hash is not found`()
    {
        val validButIncorrectHash = hash.substring(0, hash.length - 1) + "a"

        assertThrows<PackitException> { sut.getFileByHash(validButIncorrectHash, ByteArrayOutputStream()) { } }.apply {
            assertEquals("couldNotGetFile", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
    }

    @Test
    fun `getFileByHash throws a PackitException with 'bad request' when the hash is malformed`()
    {
        assertThrows<PackitException> { sut.getFileByHash("notAValidHash", ByteArrayOutputStream()) { } }.apply {
            assertEquals("couldNotGetFile", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }
}
