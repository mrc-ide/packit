package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyBoolean
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import packit.controllers.PacketController
import packit.model.GitMetadata
import packit.model.Packet
import packit.model.PacketMetadata
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

    private val packetMetadata = PacketMetadata(
        "3",
        "test",
        mapOf("name" to "value"),
        emptyList(),
        GitMetadata("git", "sha", emptyList()),
        TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
        emptyMap(),
    )

    private val htmlContentByteArray = "<html><body><h1>Test html file</h1></body></html>".toByteArray()

    private val inputStream = ByteArrayResource(htmlContentByteArray) to HttpHeaders.EMPTY

    private val indexService = mock<PacketService> {
        on { getPackets() } doReturn packets
        on { getMetadataBy(anyString()) } doReturn packetMetadata
        on { getFileByHash(anyString(), anyBoolean(), anyString()) } doReturn inputStream
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
        val result = sut.findFile("sha123", false, "test.html")
        val responseBody = result.body

        val actualText = responseBody?.inputStream?.use { it.readBytes().toString(Charsets.UTF_8) }

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals("<html><body><h1>Test html file</h1></body></html>", actualText)
        assertEquals(result.headers, inputStream.second)
    }
}
