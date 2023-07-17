package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.core.io.InputStreamResource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import packit.controllers.PacketController
import packit.model.GitMetadata
import packit.model.Metadata
import packit.model.Packet
import packit.model.TimeMetadata
import packit.service.PacketService
import java.time.Instant
import kotlin.test.assertEquals

class PacketControllerTest
{
    private val packets = listOf(
            Packet(
                    "1", "test", "test name",
                    mapOf("name" to "value"), false, Instant.now().epochSecond
            )
    )

    private val packetMetadata = Metadata(
        "3",
        "test",
        mapOf("name" to "value"),
        emptyList(),
        GitMetadata("git", "sha", emptyList()),
        TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
        emptyMap(),
    )

    private val htmlContent = "<html><body><h1>Test html file</h1></body></html>"

    private val inputStream = InputStreamResource(htmlContent.byteInputStream()) to HttpHeaders.EMPTY

    private val indexService = mock<PacketService> {
        on { getPackets() } doReturn packets
        on { getMetadataBy(anyString()) } doReturn packetMetadata
        on { getFileByHash(anyString()) } doReturn inputStream
    }

    @Test
    fun `get packets`()
    {
        val sut = PacketController(indexService)
        val result = sut.index()
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, packets)
    }

    @Test
    fun `get packet metadata by id`()
    {
        val sut = PacketController(indexService)
        val result = sut.findPacketMetadata("1")
        val responseBody = result.body
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(responseBody, packetMetadata)
    }

    @Test
    fun `get packet file by id`()
    {
        val sut = PacketController(indexService)
        val result = sut.findFile("sha123")
        val responseBody = result.body

        val actualText = responseBody?.inputStream?.use { it.readBytes().toString(Charsets.UTF_8) }

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(htmlContent, actualText)
        assertEquals(result.headers, inputStream.second)
    }
}
