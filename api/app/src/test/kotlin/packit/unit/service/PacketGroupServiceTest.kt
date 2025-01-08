package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import packit.model.*
import packit.repository.PacketGroupRepository
import packit.repository.PacketIdProjection
import packit.repository.PacketRepository
import packit.service.BasePacketGroupService
import packit.service.BasePacketService
import packit.service.OutpackServerClient
import packit.service.PacketService
import java.time.Instant
import kotlin.test.assertEquals

class PacketGroupServiceTest
{
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

    @Test
    fun `getPacketGroups calls repository with correct params and returns its result`()
    {
        val packetGroupRepository = mock<PacketGroupRepository>()
        val packetService = mock<PacketService>()
        val sut = BasePacketGroupService(packetGroupRepository, packetService)
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
    fun `getPacketGroupDisplay returns display name and description`()
    {
        val packetGroupRepository = mock<PacketGroupRepository>()
        val packetService = mock<PacketService>()
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn packetMetadata.id
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test")).thenReturn(packetIdProjection)
        whenever(packetService.getMetadataBy(packetMetadata.id)).thenReturn(packetMetadata)
        whenever(packetService.getDisplayNameForPacket(packetMetadata.custom, packetMetadata.name))
            .thenReturn(displayName)
        whenever(packetService.getDescriptionForPacket(packetMetadata.custom))
            .thenReturn(description)

        val sut = BasePacketGroupService(packetGroupRepository, packetService)

        val result = sut.getPacketGroupDisplay("test")

        assertEquals(displayName, result.latestDisplayName)
        assertEquals(description, result.description)
        verify(packetGroupRepository).findLatestPacketIdForGroup("test")
        verify(packetService).getMetadataBy(packetMetadata.id)
        verify(packetService).getDisplayNameForPacket(packetMetadata.custom, packetMetadata.name)
        verify(packetService).getDescriptionForPacket(packetMetadata.custom)
    }
}
