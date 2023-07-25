package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.*
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.PageImpl
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import packit.controllers.PacketController
import packit.model.*
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

    val now = Instant.now().epochSecond

    val mockPageablePackets = PageImpl(
        listOf(
            Packet(
                "20180818-164847-7574883b",
                "test1",
                "test name1",
                mapOf("name" to "value"),
                true,
                now,
            ),
            Packet(
                "20170819-164847-7574883b",
                "test3",
                "test name3",
                mapOf("alpha" to true),
                false,
                now
            )
        )
    )

    private val indexService = mock<PacketService> {
        on { getPackets() } doReturn packets
        on { getPackets(PageablePayload(0, 10)) } doReturn mockPageablePackets
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
    fun `get pageable packets`()
    {
        val sut = PacketController(indexService)
        val result = sut.pageableIndex(0, 10)
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPageablePackets)
        assertEquals(1, mockPageablePackets.totalPages)
        assertEquals(2, mockPageablePackets.totalElements)
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
