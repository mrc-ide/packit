package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.OutpackMetadata
import packit.model.dto.PacketGroupSummary
import packit.repository.PacketGroupRepository
import packit.repository.PacketIdProjection
import packit.service.BasePacketGroupService
import packit.service.OutpackServerClient
import packit.service.PacketService
import packit.unit.packetToOutpackMetadata
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals

class PacketGroupServiceTest
{
    private val now = Instant.now().epochSecond.toDouble()
    private val testPacketLatestId = "20190203-120000-1234dada"
    private val test2PacketLatestId = "20190403-120000-1234dfdf"

    private val displayName = "Testable Display Name"
    private val description = "A testable description"
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
            mapOf(
                "orderly" to mapOf(
                    "description" to mapOf(
                        "display" to displayName,
                        "long" to description
                    )
                )
            ),
            emptyList()
        )
    private val packets =
        listOf(
            Packet(
                "20240101-090000-4321gaga",
                "test",
                "",
                mapOf("alpha" to 1),
                now,
                now,
                now
            ),
            Packet(
                testPacketLatestId,
                "test",
                "test name (latest display name)",
                mapOf("beta" to 1),
                now,
                now + 100,
                now
            ),
            Packet(
                test2PacketLatestId,
                "test2",
                "Test 2 Display Name",
                mapOf(),
                now,
                now,
                now
            ),
            Packet(
                "20180203-120000-abdefg56",
                "test",
                "test name (old display name)",
                mapOf("name" to "value"),
                now - 50,
                (now - 100),
                now,
            ),
            Packet(
                "20180403-120000-a5bde567",
                "test2",
                "",
                mapOf("beta" to 1),
                now - 60,
                (now - 200),
                now,
            )
        )
    private val outpackServerClient =
        mock<OutpackServerClient> {
            on { getMetadata() } doReturn packets.map { packetToOutpackMetadata(it) }
        }
    private val packetGroups = listOf(PacketGroup("test"), PacketGroup("test2"))
    private val packetGroupRepository = mock<PacketGroupRepository> {
        on { findAll() } doReturn packetGroups
    }
    private val packetService = mock<PacketService>()
    private val packetGroupSummaries =
        listOf(
            PacketGroupSummary(
                name = "test",
                packetCount = 3,
                latestId = testPacketLatestId,
                latestTime = now + 100,
                latestDisplayName = "test name (latest display name)",
            ),
            PacketGroupSummary(
                name = "test2",
                packetCount = 2,
                latestId = test2PacketLatestId,
                latestTime = now,
                latestDisplayName = "Test 2 Display Name",
            )
        )

    @Test
    fun `getPacketGroups calls repository with correct params and returns its result`()
    {
        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)
        val pageablePayload = PageablePayload(0, 10)
        val filterName = "test"
        val packetGroups = listOf(PacketGroup("test1"), PacketGroup("test2"))
        whenever(
            packetGroupRepository.findAllByNameContaining(
                eq(filterName), any<Sort>()
            )
        ).thenReturn(packetGroups)

        val result = sut.getPacketGroups(pageablePayload, filterName)

        assertEquals(packetGroups, result.content)
        verify(packetGroupRepository).findAllByNameContaining(
            filterName,
            Sort.by("name")
        )
    }

    @Test
    fun `getPacketGroupDisplay returns display name and description when there is a description and a display name`()
    {
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn packetMetadata.id
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test")).thenReturn(packetIdProjection)
        whenever(packetService.getMetadataBy(packetMetadata.id)).thenReturn(packetMetadata)

        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val result = sut.getPacketGroupDisplay("test")

        assertEquals(displayName, result.latestDisplayName)
        assertEquals(description, result.description)
        verify(packetGroupRepository).findLatestPacketIdForGroup("test")
        verify(packetService).getMetadataBy(packetMetadata.id)
    }

    @Test
    fun `getPacketGroupDisplay returns display name (=name) and null description when there is no description`()
    {
        val packetMetadataWithNullDesc = packetMetadata.copy(
            custom = mapOf(
                "orderly" to mapOf(
                    "description" to mapOf(
                        "display" to null,
                        "long" to null
                    )
                )
            ),
        )
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn packetMetadataWithNullDesc.id
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test")).thenReturn(packetIdProjection)
        whenever(packetService.getMetadataBy(packetMetadataWithNullDesc.id)).thenReturn(packetMetadataWithNullDesc)

        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val result = sut.getPacketGroupDisplay("test")

        assertEquals(packetMetadataWithNullDesc.name, result.latestDisplayName)
        assertEquals(null, result.description)
        verify(packetGroupRepository).findLatestPacketIdForGroup("test")
        verify(packetService).getMetadataBy(packetMetadataWithNullDesc.id)
    }

    @Test
    fun `getPacketGroupDisplay returns display name (=name) and null description when there is no custom data`()
    {
        val packetWithoutCustomMetadata = packetMetadata.copy(
            custom = mapOf()
        )
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn packetWithoutCustomMetadata.id
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test")).thenReturn(packetIdProjection)
        whenever(packetService.getMetadataBy(packetWithoutCustomMetadata.id)).thenReturn(packetWithoutCustomMetadata)

        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val result = sut.getPacketGroupDisplay("test")

        assertEquals(packetWithoutCustomMetadata.name, result.latestDisplayName)
        assertEquals(null, result.description)
        verify(packetGroupRepository).findLatestPacketIdForGroup("test")
        verify(packetService).getMetadataBy(packetWithoutCustomMetadata.id)
    }

    @Test
    fun `gets packet groups summaries`()
    {
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test"))
            .thenReturn(object : PacketIdProjection
            {
                override val id: String = testPacketLatestId
            })
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test2"))
            .thenReturn(object : PacketIdProjection
            {
                override val id: String = test2PacketLatestId
            })
        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "")

        assertEquals(result.totalElements, 2)
        for (i in packetGroupSummaries.indices)
        {
            assertEquals(result.content[i].name, packetGroupSummaries[i].name)
            assertEquals(result.content[i].packetCount, packetGroupSummaries[i].packetCount)
            assertEquals(result.content[i].latestId, packetGroupSummaries[i].latestId)
            assertEquals(result.content[i].latestTime, packetGroupSummaries[i].latestTime, 1.0)
            assertEquals(result.content[i].latestDisplayName, packetGroupSummaries[i].latestDisplayName)
        }
        verify(packetGroupRepository).findAll()
        verify(packetGroupRepository, times(2)).findLatestPacketIdForGroup(anyString())
        verify(outpackServerClient).getMetadata()
    }

    @Test
    fun `can filter packet groups summaries by name`()
    {
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test"))
            .thenReturn(object : PacketIdProjection
            {
                override val id: String = testPacketLatestId
            })
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test2"))
            .thenReturn(object : PacketIdProjection
            {
                override val id: String = test2PacketLatestId
            })
        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "test2")

        assertEquals(result.totalElements, 1)
        assertEquals(result.content[0].name, "test2")
        verify(packetGroupRepository).findLatestPacketIdForGroup("test2")
        verify(outpackServerClient).getMetadata()
    }

    @Test
    fun `can filter packet groups summaries by display name`()
    {
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test"))
            .thenReturn(object : PacketIdProjection
            {
                override val id: String = testPacketLatestId
            })
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test2"))
            .thenReturn(object : PacketIdProjection
            {
                override val id: String = test2PacketLatestId
            })
        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "2 Display")

        assertEquals(result.totalElements, 1)
        assertEquals(result.content[0].latestDisplayName, "Test 2 Display Name")
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
            .thenReturn(object : PacketIdProjection
            {
                override val id: String = testPacketLatestId
            })

        val sut = BasePacketGroupService(packetGroupRepo, packetService, differentOutpackServerClient)

        val result = sut.getPacketGroupSummaries(PageablePayload(0, 10), "")

        assertEquals(result.totalElements, 1)
        assertEquals(result.content[0].name, "testing")
        assertEquals(result.content[0].latestDisplayName, "the display name")
        verify(packetGroupRepo).findLatestPacketIdForGroup("testing")
        verify(differentOutpackServerClient).getMetadata()
    }

    @Test
    fun `getPacketGroup returns packet group when found in repository`()
    {
        val packetGroupId = 1
        val expectedPacketGroup = PacketGroup("test")
        whenever(packetGroupRepository.findById(packetGroupId)).thenReturn(Optional.of(expectedPacketGroup))
        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val result = sut.getPacketGroup(packetGroupId)

        assertEquals(expectedPacketGroup, result)
        verify(packetGroupRepository).findById(packetGroupId)
    }

    @Test
    fun `getPacketGroup throws PackitException when packet group not found`()
    {
        val packetGroupId = 999
        whenever(packetGroupRepository.findById(packetGroupId)).thenReturn(Optional.empty())
        val sut = BasePacketGroupService(packetGroupRepository, packetService, outpackServerClient)

        val exception = assertThrows<PackitException> {
            sut.getPacketGroup(packetGroupId)
        }.apply {
            assertEquals("packetGroupNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
        verify(packetGroupRepository).findById(packetGroupId)
    }
}
