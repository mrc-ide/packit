package packit.unit.service

import org.mockito.kotlin.*
import packit.model.*
import java.util.*

class PacketServiceTest
{
//    private val now = Instant.now().epochSecond.toDouble()
//    private val newPackets =
//        listOf(
//            Packet(
//                "20240101-090000-4321gaga",
//                "test",
//                "",
//                mapOf("alpha" to 1),
//                false,
//                now,
//                now,
//                now
//            ),
//            Packet(
//                "20190203-120000-1234dada",
//                "test",
//                "test name (latest display name)",
//                mapOf("beta" to 1),
//                true,
//                now,
//                now,
//                now
//            ),
//            Packet(
//                "20190403-120000-1234dfdf",
//                "test2",
//                "test2 display name",
//                mapOf(),
//                false,
//                now,
//                now,
//                now
//            )
//        )
//
//    private val oldPackets =
//        listOf(
//            Packet(
//                "20180203-120000-abdefg56",
//                "test",
//                "test name (old display name)",
//                mapOf("name" to "value"),
//                false,
//                now - 1,
//                (now - 1),
//                (now - 1),
//            ),
//            Packet(
//                "20180403-120000-a5bde567",
//                "test2",
//                "",
//                mapOf("beta" to 1),
//                true,
//                now - 2,
//                (now - 2),
//                (now - 2),
//            )
//        )
//
//    private val metadata =
//        newPackets.map {
//            OutpackMetadata(
//                it.id,
//                it.name,
//                it.parameters,
//                TimeMetadata(now, now),
//                mapOf(
//                    "orderly" to mapOf(
//                        "description" to mapOf(
//                            "display" to it.displayName
//                        )
//                    )
//                )
//            )
//        }
//    private val packetMetadata =
//        PacketMetadata(
//            "3",
//            "test",
//            mapOf("name" to "value"),
//            emptyList(),
//            GitMetadata("git", "sha", emptyList()),
//            TimeMetadata(
//                Instant.now().epochSecond.toDouble(),
//                Instant.now().epochSecond.toDouble()
//            ),
//            emptyMap(),
//            emptyList()
//        )
//    private val packetGroupSummaries =
//        listOf(
//            object : PacketGroupSummary
//            {
//                override fun getName(): String = ""
//                override fun getPacketCount(): Int = 10
//                override fun getLatestId(): String = "20180818-164847-7574883b"
//                override fun getLatestTime(): Double = 1690902034.0
//                override fun getLatestDisplayName(): String = ""
//            },
//            object : PacketGroupSummary
//            {
//                override fun getName(): String = ""
//                override fun getPacketCount(): Int = 10
//                override fun getLatestId(): String = "20180818-164847-7574883b"
//                override fun getLatestTime(): Double = 1690902034.0
//                override fun getLatestDisplayName(): String = ""
//            }
//        )
//
//    private val responseByte = "htmlContent".toByteArray() to HttpHeaders.EMPTY
//
//    private val packetRepository =
//        mock<PacketRepository> {
//            on { findAll() } doReturn oldPackets
//            on { findAllIds() } doReturn oldPackets.map { it.id }
//            on { findTopByOrderByImportTimeDesc() } doReturn oldPackets.first()
//            on { getFilteredPacketGroupSummaries("random") } doReturn
//                    packetGroupSummaries
//            on { findByName(anyString(), any()) } doReturn oldPackets
//            on { findAllByNameContainingAndIdContaining(anyString(), anyString(), any<Sort>()) } doReturn oldPackets
//        }
//
//    private val outpackServerClient =
//        mock<OutpackServerClient> {
//            on { getMetadata(now - 1) } doReturn metadata
//            on { getMetadataById(anyString()) } doReturn packetMetadata
//            on { getFileByHash(anyString()) } doReturn responseByte
//        }
//    private val packetGroupRepository = mock<PacketGroupRepository>()
//
//    @Test
//    fun `gets packets`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        val result = sut.getPackets()
//
//        assertEquals(result, oldPackets)
//    }
//
//    @Test
//    fun `getPackets calls repository with correct params and returns its result`()
//    {
//        val pageablePayload = PageablePayload(pageNumber = 0, pageSize = 10)
//        val filterName = "para"
//        val filterId = "123"
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        val result = sut.getPackets(pageablePayload, filterName, filterId)
//
//        assertEquals(oldPackets, result.content)
//        verify(packetRepository).findAllByNameContainingAndIdContaining(
//            filterName,
//            filterId,
//            Sort.by("startTime").descending()
//        )
//    }
//
//    @Test
//    fun `gets packets by name`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        val result = sut.getPacketsByName("pg1", PageablePayload(0, 10))
//
//        assertEquals(result.content, oldPackets)
//        verify(packetRepository)
//            .findByName("pg1", Sort.by("startTime").descending())
//    }
//
//    @Test
//    fun `gets packet groups summary`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        val result = sut.getPacketGroupDisplays(PageablePayload(0, 10), "random")
//
//        assertEquals(result.totalElements, 2)
//        assertEquals(result.content, packetGroupSummaries)
//        verify(packetRepository).getFilteredPacketGroupSummaries("random")
//    }
//
//    @Test
//    fun `throws exception if packet metadata does not exist`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        assertThatThrownBy { sut.getMetadataBy("123") }
//            .isInstanceOf(PackitException::class.java)
//            .hasMessageContaining("PackitException with key doesNotExist")
//    }
//
//    @Test
//    fun `gets checksum of packet ids`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        val result = sut.getChecksum()
//
//        val expected = "sha256:723cf37faa446c3d4cf11659b5e4eb7a8ad93d847c344846962a9ddefa37519e"
//        assertEquals(result, expected)
//    }
//
//    @Test
//    fun `imports packets and saves`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
//        val argumentCaptor = argumentCaptor<List<Packet>>()
//
//        sut.importPackets()
//
//        verify(packetRepository).saveAll(argumentCaptor.capture())
//        val packets = argumentCaptor.allValues.flatten()
//        assertEquals(packets.size, 3)
//        val expectedDisplayNames = mapOf(
//            "20240101-090000-4321gaga" to "test", // This packet has no display name, so should fall back to its name.
//            "20190203-120000-1234dada" to "test name (latest display name)",
//            "20190403-120000-1234dfdf" to "test2 display name"
//        )
//        newPackets.forEach() {
//            val packet = packets.find { packet -> packet.id == it.id }
//            assertEquals(packet!!.displayName, expectedDisplayNames[it.id])
//        }
//    }
//
//    @Test
//    fun `can import non-orderly packets that use the outpack custom property to specify a display name`()
//    {
//        val metadataWithDifferentCustomSchema = listOf(
//            OutpackMetadata(
//            "20240101-090000-4321gaga",
//            "test",
//            mapOf("alpha" to 1),
//            TimeMetadata(now, now),
//            mapOf(
//                "different" to mapOf(
//                    "display" to "the display name",
//                )
//            )
//        )
//        )
//        val differentOutpackServerClient =
//            mock<OutpackServerClient> {
//                on { getMetadata(now - 1) } doReturn metadataWithDifferentCustomSchema
//            }
//        val sut = BasePacketService(packetRepository, packetGroupRepository, differentOutpackServerClient)
//        val argumentCaptor = argumentCaptor<List<Packet>>()
//
//        sut.importPackets()
//
//        verify(packetRepository).saveAll(argumentCaptor.capture())
//        val packets = argumentCaptor.allValues.flatten()
//        assertEquals(packets[0].displayName, "the display name")
//    }
//
//    @Test
//    fun `importPackets saves unique packet groups`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
//        val argumentCaptor = argumentCaptor<List<PacketGroup>>()
//
//        sut.importPackets()
//
//        verify(packetGroupRepository).saveAll(argumentCaptor.capture())
//        val packetGroups = argumentCaptor.allValues.flatten()
//        assertEquals(packetGroups.size, 2)
//
//        assertEquals(packetGroups.first().name, "test")
//        // The latest packet has no display name, even though the previous packet has one.
//        assertEquals(packetGroups.first().latestDisplayName, "test")
//
//        assertEquals(packetGroups.last().name, "test2")
//        // The latest packet's display name is used.
//        assertEquals(packetGroups.last().latestDisplayName, "test2 display name")
//    }
//
//    @Test
//    fun `saveUniquePacketGroups upserts unique packet groups`() {
//        val packetGroupData = mapOf(
//            "never_before_seen_packet" to "Brand-new packet display name",
//            "existing_packet" to "Updated display name for existing packet"
//        )
//        val packetGroupNames = packetGroupData.keys.toList()
//        `when`(packetGroupRepository.findByNameIn(packetGroupNames)).doReturn(
//            listOf(
//            PacketGroup("existing_packet", "outdated display name", mutableListOf(), 9)
//        )
//        )
//        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
//        val newPacketGroupsArgumentCaptor = argumentCaptor<List<PacketGroup>>()
//        val existingPacketGroupsArgumentCaptor = argumentCaptor<PacketGroup>()
//
//        sut.saveUniquePacketGroups(packetGroupData)
//
//        verify(packetGroupRepository).saveAll(newPacketGroupsArgumentCaptor.capture())
//        val newPacketGroups = newPacketGroupsArgumentCaptor.firstValue
//        assertEquals(newPacketGroups.size, 1)
//        assertEquals(newPacketGroups.first().name, "never_before_seen_packet")
//        assertEquals(newPacketGroups.first().latestDisplayName, "Brand-new packet display name")
//
//        verify(packetGroupRepository).save(existingPacketGroupsArgumentCaptor.capture())
//        val existingPacketGroup = existingPacketGroupsArgumentCaptor.firstValue
//        assertEquals(existingPacketGroup.name, "existing_packet")
//        assertEquals(existingPacketGroup.latestDisplayName, "Updated display name for existing packet")
//        assertEquals(existingPacketGroup.id, 9)
//    }
//
//    @Test
//    fun `can get packet metadata`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
//        val result = sut.getMetadataBy("123")
//
//        assertEquals(result, packetMetadata)
//    }
//
//    @Test
//    fun `can get packet file`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, outpackServerClient)
//        val result = sut.getFileByHash("sha123", true, "test.html")
//
//        assertEquals(result.first.isReadable, true)
//    }
//
//    @Test
//    fun `throws exception if client could not get file from outpack`()
//    {
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        assertThatThrownBy { sut.getFileByHash("123", true, "test.html") }
//            .isInstanceOf(PackitException::class.java)
//            .hasMessageContaining("PackitException with key doesNotExist")
//    }
//
//    @Test
//    fun `getPacket returns packet when packet exists with given id`()
//    {
//        whenever(packetRepository.findById(oldPackets[0].id)).thenReturn(Optional.of(oldPackets[0]))
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        val result = sut.getPacket(oldPackets[0].id)
//
//        assertEquals(oldPackets[0], result)
//    }
//
//    @Test
//    fun `getPacket throws PackitException when no packet exists with given id`()
//    {
//        val packetId = "nonExistingId"
//        whenever(packetRepository.findById(packetId)).thenReturn(Optional.empty())
//        val sut = BasePacketService(packetRepository, packetGroupRepository, mock())
//
//        assertThrows<PackitException> {
//            sut.getPacket(packetId)
//        }
//    }
}
