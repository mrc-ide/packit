package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.anyBoolean
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.PageImpl
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import packit.controllers.PacketController
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.PacketGroupSummary
import packit.service.PacketGroupService
import packit.service.PacketService
import java.time.Instant
import kotlin.test.assertEquals

class PacketControllerTest
{
    val now = Instant.now().epochSecond.toDouble()

    private val packetMetadata = listOf(
        PacketMetadata(
            "20180818-164847-7574883b",
            "test",
            mapOf("name" to "value"),
            listOf(
                FileMetadata(
                "hello.txt",
                size = 49,
                hash = "sha256:87bfc90d2294c957bf1487506dacb2aeb6455d6caba94910e48434211a7c639b"
            )
            ),
            GitMetadata("git", "sha", emptyList()),
            TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
            emptyMap(),
            emptyList()
        ),
        PacketMetadata(
            "20170819-164847-7574883b",
            "test",
            mapOf("name" to "value"),
            emptyList(),
            null,
            TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
            emptyMap(),
            emptyList()
        )
    )

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
        PacketGroupSummary(
            name = "analysis 1",
            packetCount = 10,
            latestId = "20180818-164847-7574883b",
            latestTime = 1690902034.0,
            latestDisplayName = "display name for analysis 1",
        ),
        PacketGroupSummary(
            name = "analysis 2",
            packetCount = 10,
            latestId = "20180818-164847-7574883b",
            latestTime = 1690902034.0,
            latestDisplayName = "display name for analysis 2",
        ),
    )

    private val htmlContentByteArray = "<html><body><h1>Test html file</h1></body></html>".toByteArray()

    private val inputStream = ByteArrayResource(htmlContentByteArray) to HttpHeaders.EMPTY

    private val mockPageablePackets = PageImpl(packets)
    private val mockPacketGroupsSummary = PageImpl(packetGroupSummaries)

    private val packetService = mock<PacketService> {
        on { getPackets(PageablePayload(0, 10), "", "") } doReturn mockPageablePackets
        on { getFileByHash(anyString(), anyBoolean(), anyString()) } doReturn inputStream
        on { getPacketsByName(anyString()) } doReturn packets

        packetMetadata.forEach {
            on { getMetadataBy(it.id) } doReturn it
        }
    }
    private val packetGroupService = mock<PacketGroupService> {
        on { getPacketGroupSummaries(PageablePayload(0, 10), "") } doReturn mockPacketGroupsSummary
    }

    @Test
    fun `get pageable packets`()
    {
        val sut = PacketController(packetService, packetGroupService)
        val result = sut.pageableIndex(0, 10, "", "")
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPageablePackets.map { it.toDto() })
        assertEquals(1, mockPageablePackets.totalPages)
        assertEquals(2, mockPageablePackets.totalElements)
    }

    @Test
    fun `get packets by packet group name`()
    {
        val sut = PacketController(packetService, packetGroupService)

        val result = sut.getPacketsByName("pg1")

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, packets.map { it.toDto() })
        verify(packetService).getPacketsByName("pg1")
    }

    @Test
    fun `get packet groups summary`()
    {
        val sut = PacketController(packetService, packetGroupService)
        val result = sut.getPacketGroupSummaries(0, 10, "")
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPacketGroupsSummary)
        verify(packetGroupService).getPacketGroupSummaries(PageablePayload(0, 10), "")
    }

    @Test
    fun `get packet metadata by id`()
    {
        val sut = PacketController(packetService, packetGroupService)
        val result = sut.findPacketMetadata("20180818-164847-7574883b")
        val responseBody = result.body
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(responseBody, packetMetadata[0])
    }

    @Test
    fun `get packet file by id`()
    {
        val sut = PacketController(packetService, packetGroupService)
        val result = sut.findFile(
            id = "20180818-164847-7574883b",
            hash = "sha256:87bfc90d2294c957bf1487506dacb2aeb6455d6caba94910e48434211a7c639b",
            false,
            "test.html"
        )
        val responseBody = result.body

        val actualText = responseBody?.inputStream?.use { it.readBytes().toString(Charsets.UTF_8) }

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals("<html><body><h1>Test html file</h1></body></html>", actualText)
        assertEquals(result.headers, inputStream.second)
    }

    @Test
    fun `cannot get file from different packet`()
    {
        val sut = PacketController(packetService, packetGroupService)
        val error = assertThrows<PackitException> {
            sut.findFile(
                id = "20170819-164847-7574883b",
                hash = "sha256:87bfc90d2294c957bf1487506dacb2aeb6455d6caba94910e48434211a7c639b",
                false,
                "test.html"
            )
        }
        assertEquals("doesNotExist", error.key)
    }
}
