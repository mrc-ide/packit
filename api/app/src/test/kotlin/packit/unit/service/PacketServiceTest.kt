package packit.unit.service

import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import packit.exceptions.PackitException
import packit.model.*
import packit.repository.PacketRepository
import packit.service.BasePacketService
import packit.service.OutpackServerClient
import java.time.Instant
import kotlin.test.assertEquals

class PacketServiceTest
{
    private val now = Instant.now().epochSecond.toDouble()
    private val newPackets =
        listOf(
            Packet(
                "20190203-120000-1234dada",
                "test",
                "test",
                mapOf("alpha" to 1),
                false,
                now,
                now,
                now
            ),
            Packet("20190403-120000-1234dfdf", "test2", "test2", mapOf(), false, now, now, now)
        )

    private val oldPackets =
        listOf(
            Packet(
                "20180203-120000-abdefg56",
                "test",
                "test name",
                mapOf("name" to "value"),
                false,
                now - 1,
                (now - 1),
                (now - 1),
            ),
            Packet(
                "20180403-120000-a5bde567",
                "test2",
                "test2 name",
                mapOf("beta" to 1),
                true,
                now - 2,
                (now - 2),
                (now - 2),
            )
        )

    private val metadata =
        listOf(
            OutpackMetadata(
                "20190203-120000-1234dada",
                "test",
                parameters = mapOf("alpha" to 1),
                time = TimeMetadata(now, now)
            ),
            OutpackMetadata(
                "20190403-120000-1234dfdf",
                "test2",
                null,
                time = TimeMetadata(now, now)
            )
        )

    private val packetMetadata =
        PacketMetadata(
            "3",
            "test",
            mapOf("name" to "value"),
            emptyList(),
            GitMetadata("git", "sha", emptyList()),
            TimeMetadata(
                Instant.now().epochSecond.toDouble(),
                Instant.now().epochSecond.toDouble()
            ),
            emptyMap(),
        )
    private val packetGroupSummaries =
        listOf(
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

    private val responseByte = "htmlContent".toByteArray() to HttpHeaders.EMPTY
    private val mockPacketGroupSummaries = PageImpl(packetGroupSummaries)

    private val packetRepository =
        mock<PacketRepository> {
            on { findAll() } doReturn oldPackets
            on { findAllIds() } doReturn oldPackets.map { it.id }
            on { findTopByOrderByImportTimeDesc() } doReturn oldPackets.first()
            on { findPacketGroupSummaryByName("random", PageRequest.of(0, 10)) } doReturn
                    mockPacketGroupSummaries
            on { findByName(anyString(), any()) } doReturn PageImpl(oldPackets)
        }

    private val outpackServerClient =
        mock<OutpackServerClient> {
            on { getMetadata(now - 1) } doReturn metadata
            on { getMetadataById(anyString()) } doReturn packetMetadata
            on { getFileByHash(anyString()) } doReturn responseByte
        }

    @Test
    fun `gets packets`()
    {
        val sut = BasePacketService(packetRepository, mock())

        val result = sut.getPackets()

        assertEquals(result, oldPackets)
    }

    @Test
    fun `gets packets by name`()
    {
        val sut = BasePacketService(packetRepository, mock())

        val result = sut.getPacketsByName("pg1", PageablePayload(0, 10))

        assertEquals(result, PageImpl(oldPackets))
        verify(packetRepository)
            .findByName("pg1", PageRequest.of(0, 10, Sort.by("startTime").descending()))
    }

    @Test
    fun `gets packet groups summary`()
    {
        val sut = BasePacketService(packetRepository, mock())

        val result = sut.getPacketGroupSummary(PageablePayload(0, 10), "random")

        assertEquals(result.totalElements, 2)
        assertEquals(result.content, packetGroupSummaries)
        verify(packetRepository).findPacketGroupSummaryByName("random", PageRequest.of(0, 10))
    }

    @Test
    fun `throws exception if packet metadata does not exist`()
    {
        val sut = BasePacketService(packetRepository, mock())

        assertThatThrownBy { sut.getMetadataBy("123") }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key doesNotExist")
    }

    @Test
    fun `gets checksum of packet ids`()
    {
        val sut = BasePacketService(packetRepository, mock())

        val result = sut.getChecksum()

        val expected = "sha256:723cf37faa446c3d4cf11659b5e4eb7a8ad93d847c344846962a9ddefa37519e"
        assertEquals(result, expected)
    }

    @Test
    fun `imports packets`()
    {
        val sut = BasePacketService(packetRepository, outpackServerClient)
        sut.importPackets()

        verify(packetRepository).saveAll(newPackets)
    }

    @Test
    fun `can get packet metadata`()
    {
        val sut = BasePacketService(packetRepository, outpackServerClient)
        val result = sut.getMetadataBy("123")

        assertEquals(result, packetMetadata)
    }

    @Test
    fun `can get packet file`()
    {
        val sut = BasePacketService(packetRepository, outpackServerClient)
        val result = sut.getFileByHash("sha123", true, "test.html")

        assertEquals(result.first.isReadable, true)
    }

    @Test
    fun `throws exception if client could not get file from outpack`()
    {
        val sut = BasePacketService(packetRepository, mock())

        assertThatThrownBy { sut.getFileByHash("123", true, "test.html") }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key doesNotExist")
    }
}
