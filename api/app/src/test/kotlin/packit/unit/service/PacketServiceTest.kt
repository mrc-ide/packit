package packit.unit.service

import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.`when`
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.OutpackMetadata
import packit.model.dto.PacketGroupSummary
import packit.repository.PacketGroupRepository
import packit.repository.PacketIdProjection
import packit.repository.PacketRepository
import packit.service.BasePacketService
import packit.service.OutpackServerClient
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals

class PacketServiceTest
{
    private val now = Instant.now().epochSecond.toDouble()
    private val testPacketLatestId = "20190203-120000-1234dada"
    private val test2PacketLatestId = "20190403-120000-1234dfdf"

    private val newPackets =
        listOf(
            Packet(
                "20240101-090000-4321gaga",
                "test",
                "",
                mapOf("alpha" to 1),
                false,
                now,
                now,
                now
            ),
            Packet(
                testPacketLatestId,
                "test",
                "test name (latest display name)",
                mapOf("beta" to 1),
                true,
                now,
                now + 100,
                now
            ),
            Packet(
                test2PacketLatestId,
                "test2",
                "Test 2 Display Name",
                mapOf(),
                false,
                now,
                now,
                now
            )
        )

    private val oldPackets =
        listOf(
            Packet(
                "20180203-120000-abdefg56",
                "test",
                "test name (old display name)",
                mapOf("name" to "value"),
                false,
                now - 50,
                (now - 100),
                now,
            ),
            Packet(
                "20180403-120000-a5bde567",
                "test2",
                "",
                mapOf("beta" to 1),
                true,
                now - 60,
                (now - 200),
                now,
            )
        )

    private fun packetToOutpackMetadata(packet: Packet): OutpackMetadata
    {
        return OutpackMetadata(
            packet.id,
            packet.name,
            packet.parameters,
            TimeMetadata(packet.endTime, packet.startTime),
            mapOf(
                "orderly" to mapOf(
                    "description" to mapOf(
                        "display" to packet.displayName,
                        "long" to "Description for ${packet.name}"
                    )
                )
            )
        )
    }


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
            emptyList()
        )
    private val packetGroupSummaries =
        listOf(
            object : PacketGroupSummary
            {
                override fun getName(): String = "test"
                override fun getPacketCount(): Int = 3
                override fun getLatestId(): String = testPacketLatestId
                override fun getLatestTime(): Double = now + 100
                override fun getLatestDisplayName(): String = "test name (latest display name)"
                override fun getLatestDescription(): String? = "Description for test"
            },
            object : PacketGroupSummary
            {
                override fun getName(): String = "test2"
                override fun getPacketCount(): Int = 2
                override fun getLatestId(): String = test2PacketLatestId
                override fun getLatestTime(): Double = now
                override fun getLatestDisplayName(): String = "Test 2 Display Name"
                override fun getLatestDescription(): String? = "Description for test2"
            }
        )

    private val responseByte = "htmlContent".toByteArray() to HttpHeaders.EMPTY

    private val packetRepository =
        mock<PacketRepository> {
            on { findAll() } doReturn oldPackets
            on { findAllIds() } doReturn oldPackets.map { it.id }
            on { findTopByOrderByImportTimeDesc() } doReturn oldPackets.first()
            on { findByName(anyString(), any()) } doReturn oldPackets
            on { findAllByNameContainingAndIdContaining(anyString(), anyString(), any<Sort>()) } doReturn oldPackets
        }

    private val packetGroups = listOf(PacketGroup("test"), PacketGroup("test2"))
    private val packetGroupRepository = mock<PacketGroupRepository> {
        on { findAll() } doReturn packetGroups
    }

    private val allMetadata = newPackets.map { packetToOutpackMetadata(it) } + oldPackets.map { packetToOutpackMetadata(it) }
    private val outpackServerClient =
        mock<OutpackServerClient> {
            on { getMetadata(oldPackets[0].importTime) } doReturn newPackets.map { packetToOutpackMetadata(it) }
            on { getMetadata() } doReturn allMetadata
            on { getMetadataById(anyString()) } doReturn packetMetadata
            on { getFileByHash(anyString()) } doReturn responseByte
        }

    @Test
    fun `gets packets`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        val result = sut.getPackets()

        assertEquals(result, oldPackets)
    }

    @Test
    fun `getPackets calls repository with correct params and returns its result`()
    {
        val pageablePayload = PageablePayload(pageNumber = 0, pageSize = 10)
        val filterName = "para"
        val filterId = "123"
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        val result = sut.getPackets(pageablePayload, filterName, filterId)

        assertEquals(oldPackets, result.content)
        verify(packetRepository).findAllByNameContainingAndIdContaining(
            filterName,
            filterId,
            Sort.by("startTime").descending()
        )
    }

    @Test
    fun `gets packets by name`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        val result = sut.getPacketsByName("pg1", PageablePayload(0, 10))

        assertEquals(result.content, oldPackets)
        verify(packetRepository)
            .findByName("pg1", Sort.by("startTime").descending())
    }

    @Test
    fun `gets packet groups summaries`()
    {
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test"))
            .thenReturn(object : PacketIdProjection { override val id: String = testPacketLatestId })
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test2"))
            .thenReturn(object : PacketIdProjection { override val id: String = test2PacketLatestId })
        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "")

        assertEquals(result.totalElements, 2)
        for (i in packetGroupSummaries.indices) {
            assertEquals(result.content[i].getName(), packetGroupSummaries[i].getName())
            assertEquals(result.content[i].getPacketCount(), packetGroupSummaries[i].getPacketCount())
            assertEquals(result.content[i].getLatestId(), packetGroupSummaries[i].getLatestId())
            assertEquals(result.content[i].getLatestTime(), packetGroupSummaries[i].getLatestTime(), 1.0)
            assertEquals(result.content[i].getLatestDisplayName(), packetGroupSummaries[i].getLatestDisplayName())
            assertEquals(result.content[i].getLatestDescription(), packetGroupSummaries[i].getLatestDescription())
        }
        verify(packetGroupRepository).findAll()
        verify(packetGroupRepository, times(2)).findLatestPacketIdForGroup(anyString())
        verify(outpackServerClient).getMetadata()
    }

    @Test
    fun `can filter packet groups summaries by name`()
    {
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test"))
            .thenReturn(object : PacketIdProjection { override val id: String = testPacketLatestId })
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test2"))
            .thenReturn(object : PacketIdProjection { override val id: String = test2PacketLatestId })
        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "test2")

        assertEquals(result.totalElements, 1)
        assertEquals(result.content[0].getName(), "test2")
        verify(packetGroupRepository).findLatestPacketIdForGroup("test2")
        verify(outpackServerClient).getMetadata()
    }

    @Test
    fun `can filter packet groups summaries by display name`()
    {
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test"))
            .thenReturn(object : PacketIdProjection { override val id: String = testPacketLatestId })
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test2"))
            .thenReturn(object : PacketIdProjection { override val id: String = test2PacketLatestId })
        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "2 Display")

        assertEquals(result.totalElements, 1)
        assertEquals(result.content[0].getLatestDisplayName(), "Test 2 Display Name")
        verify(packetGroupRepository).findLatestPacketIdForGroup("test2")
        verify(outpackServerClient).getMetadata()
    }

    @Test
    fun `can get summaries for non-orderly packets that use the outpack custom property to specify a display name`()
    {
        val metadataWithDifferentCustomSchema = listOf(
            OutpackMetadata(
                testPacketLatestId,
            "testing",
                mapOf("alpha" to 1),
                TimeMetadata(now, now),
                mapOf(
                    "different" to mapOf(
                        "display" to "the display name",
                    )
                )
            )
        )
        val differentOutpackServerClient = mock<OutpackServerClient> {
            on { getMetadata() } doReturn metadataWithDifferentCustomSchema
        }

        val packetGroupRepo = mock<PacketGroupRepository> {
            on { findAll() } doReturn listOf(PacketGroup("testing"))
        }
        whenever(packetGroupRepo.findLatestPacketIdForGroup("testing"))
            .thenReturn(object : PacketIdProjection { override val id: String = testPacketLatestId })

        val sut = BasePacketService(packetRepository, packetGroupRepo, differentOutpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "")

        assertEquals(result.totalElements, 1)
        assertEquals(result.content[0].getName(), "testing")
        assertEquals(result.content[0].getLatestDisplayName(), "the display name")
        verify(packetGroupRepo).findLatestPacketIdForGroup("testing")
        verify(differentOutpackServerClient).getMetadata()
    }

    @Test
    fun `throws exception if packet metadata does not exist`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        assertThatThrownBy { sut.getMetadataBy("123") }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key doesNotExist")
    }

    @Test
    fun `gets checksum of packet ids`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        val result = sut.getChecksum()

        val expected = "sha256:723cf37faa446c3d4cf11659b5e4eb7a8ad93d847c344846962a9ddefa37519e"
        assertEquals(result, expected)
    }

    @Test
    fun `imports packets and saves`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
        val argumentCaptor = argumentCaptor<List<Packet>>()

        sut.importPackets()

        verify(packetRepository).saveAll(argumentCaptor.capture())
        val packets = argumentCaptor.allValues.flatten()
        assertEquals(packets.size, 3)
    }

    @Test
    fun `importPackets saves unique packet groups`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
        val argumentCaptor = argumentCaptor<List<PacketGroup>>()

        sut.importPackets()

        verify(packetGroupRepository).saveAll(argumentCaptor.capture())
        val packetGroups = argumentCaptor.allValues.flatten()
        assertEquals(packetGroups.size, 2)

        assertEquals(packetGroups.first().name, "test")
        assertEquals(packetGroups.last().name, "test2")
    }

    @Test
    fun `can get packet metadata`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
        val result = sut.getMetadataBy("123")

        assertEquals(result, packetMetadata)
    }

    @Test
    fun `can get packet file`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
        val result = sut.getFileByHash("sha123", true, "test.html")

        assertEquals(result.first.isReadable, true)
    }

    @Test
    fun `throws exception if client could not get file from outpack`()
    {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        assertThatThrownBy { sut.getFileByHash("123", true, "test.html") }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key doesNotExist")
    }

    @Test
    fun `getPacket returns packet when packet exists with given id`()
    {
        whenever(packetRepository.findById(oldPackets[0].id)).thenReturn(Optional.of(oldPackets[0]))
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        val result = sut.getPacket(oldPackets[0].id)

        assertEquals(oldPackets[0], result)
    }

    @Test
    fun `getPacket throws PackitException when no packet exists with given id`()
    {
        val packetId = "nonExistingId"
        whenever(packetRepository.findById(packetId)).thenReturn(Optional.empty())
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())

        assertThrows<PackitException> {
            sut.getPacket(packetId)
        }
    }
}
