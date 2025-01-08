package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import packit.model.*
import packit.repository.PacketGroupRepository
import packit.repository.PacketIdProjection
import packit.service.BasePacketGroupService
import packit.service.PacketService
import java.time.Instant
import kotlin.test.assertEquals

class PacketGroupServiceTest
{
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
    fun `getPacketGroupDisplay returns display name and description when there is a description and a display name`()
    {
        val packetGroupRepository = mock<PacketGroupRepository>()
        val packetService = mock<PacketService>()
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn packetMetadata.id
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test")).thenReturn(packetIdProjection)
        whenever(packetService.getMetadataBy(packetMetadata.id)).thenReturn(packetMetadata)

        val sut = BasePacketGroupService(packetGroupRepository, packetService)

        val result = sut.getPacketGroupDisplay("test")

        assertEquals(displayName, result.latestDisplayName)
        assertEquals(description, result.description)
        verify(packetGroupRepository).findLatestPacketIdForGroup("test")
        verify(packetService).getMetadataBy(packetMetadata.id)
    }

    @Test
    fun `getPacketGroupDisplay returns display name (=name) and description when there is no description`()
    {
        val packetMetadataWithNullDescription = packetMetadata.copy(
            custom = mapOf(
                "orderly" to mapOf(
                    "description" to mapOf(
                        "display" to null,
                        "long" to null
                    )
                )
            ),
        )
        val packetGroupRepository = mock<PacketGroupRepository>()
        val packetService = mock<PacketService>()
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn packetMetadataWithNullDescription.id
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test")).thenReturn(packetIdProjection)
        whenever(packetService.getMetadataBy(packetMetadataWithNullDescription.id)).thenReturn(packetMetadataWithNullDescription)

        val sut = BasePacketGroupService(packetGroupRepository, packetService)

        val result = sut.getPacketGroupDisplay("test")

        assertEquals(packetMetadataWithNullDescription.name, result.latestDisplayName)
        assertEquals(null, result.description)
        verify(packetGroupRepository).findLatestPacketIdForGroup("test")
        verify(packetService).getMetadataBy(packetMetadataWithNullDescription.id)
    }

    @Test
    fun `getPacketGroupDisplay returns display name (=name) and description when there is no custom data`()
    {
        val packetWithoutCustomMetadata = packetMetadata.copy(
            custom = mapOf()
        )
        val packetGroupRepository = mock<PacketGroupRepository>()
        val packetService = mock<PacketService>()
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn packetWithoutCustomMetadata.id
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup("test")).thenReturn(packetIdProjection)
        whenever(packetService.getMetadataBy(packetWithoutCustomMetadata.id)).thenReturn(packetWithoutCustomMetadata)

        val sut = BasePacketGroupService(packetGroupRepository, packetService)

        val result = sut.getPacketGroupDisplay("test")

        assertEquals(packetWithoutCustomMetadata.name, result.latestDisplayName)
        assertEquals(null, result.description)
        verify(packetGroupRepository).findLatestPacketIdForGroup("test")
        verify(packetService).getMetadataBy(packetWithoutCustomMetadata.id)
    }
}
