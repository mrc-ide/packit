package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyBoolean
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
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
    val now = Instant.now().epochSecond.toDouble()

    private val packets = listOf(
        Packet(
            "20180818-164847-7574883b",
            "test1",
            "test name1",
            mapOf("name" to "value"),
            true,
            now,
            now,
            now,
        ),
        Packet(
            "20170819-164847-7574883b",
            "test3",
            "test name3",
            mapOf("alpha" to true),
            false,
            1690902034.0,
            1690902034.0,
            1690902034.0

        )
    )

    private val packetGroupSummaries = listOf(
        object : PacketGroupSummary
        {
            override fun getName(): String = ""
            override fun getPacketCount(): Int = 10
            override fun getLatestId(): String = "20180818-164847-7574883b"
            override fun getLatestTime(): Double = 1690902034.0
        },
        object : PacketGroupSummary
        {
            override fun getName(): String = ""
            override fun getPacketCount(): Int = 10
            override fun getLatestId(): String = "20180818-164847-7574883b"
            override fun getLatestTime(): Double = 1690902034.0
        }
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

    private val mockPageablePackets = PageImpl(packets)
    private val mockPacketGroupsSummary = PageImpl(packetGroupSummaries)

    private val indexService = mock<PacketService> {
        on { getPackets(PageablePayload(0, 10)) } doReturn mockPageablePackets
        on { getMetadataBy(anyString()) } doReturn packetMetadata
        on { getFileByHash(anyString(), anyBoolean(), anyString()) } doReturn inputStream
        on { getPacketGroupSummary(PageablePayload(0, 10), "") } doReturn mockPacketGroupsSummary
        on { getPacketsByName(anyString(), any()) } doReturn mockPageablePackets
    }

    @Test
    fun `get pageable packets`()
    {
        val sut = PacketController(indexService)
        val result = sut.pageableIndex(0, 10)
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPageablePackets.map { it.toDto() })
        assertEquals(1, mockPageablePackets.totalPages)
        assertEquals(2, mockPageablePackets.totalElements)
    }

    @Test
    fun `get packets by packet group name`()
    {
        val sut = PacketController(indexService)

        val result = sut.getPacketsByName("pg1", 0, 10)

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPageablePackets.map { it.toDto() })
        verify(indexService).getPacketsByName("pg1", PageablePayload(0, 10))
    }

    @Test
    fun `get packet groups summary`()
    {
        val sut = PacketController(indexService)
        val result = sut.getPacketGroupSummary(0, 10, "")
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPacketGroupsSummary)
        verify(indexService).getPacketGroupSummary(PageablePayload(0, 10), "")
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
