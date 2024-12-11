package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import packit.model.PacketGroup
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.TimeMetadata
import packit.repository.PacketGroupRepository
import packit.repository.PacketIdProjection
import packit.service.BasePacketGroupService
import packit.service.PacketService
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
        val packetGroups = listOf(PacketGroup("test1", "display1"), PacketGroup("test2", "display2"))
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
    fun `getPacketGroupDisplay returns display name, and description`()
    {
        val packetGroupRepository = mock<PacketGroupRepository>()
        val packetService = mock<PacketService>()

        val groupName = "testGroup"
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn "20170818-164847-7574853b"
        }
        whenever(packetGroupRepository.findLatestPacketIdForGroup(groupName)).thenReturn(packetIdProjection)

        val packetGroup = PacketGroup("testGroup", "Display Name")
        whenever(packetGroupRepository.findByName(groupName)).thenReturn(packetGroup)

        val mockPacketMetadata = PacketMetadata(
            id = "20170818-164847-7574853b",
            name = "testPacket",
            parameters = null,
            files = null,
            git = null,
            time = TimeMetadata(start = 0.0, end = 0.0),
            custom = mapOf(
                "orderly" to mapOf("description" to mapOf("long" to "Long description"))
            ),
            depends = null
        )
        whenever(packetService.getMetadataBy("20170818-164847-7574853b")).thenReturn(mockPacketMetadata)

        val sut = BasePacketGroupService(packetGroupRepository, packetService)

        val result = sut.getPacketGroupDisplay(groupName)

        assertEquals("Display Name", result.displayName)
        assertEquals("Long description", result.packetDescription)
        verify(packetGroupRepository).findLatestPacketIdForGroup(groupName)
        verify(packetGroupRepository).findByName(groupName)
        verify(packetService).getMetadataBy("20170818-164847-7574853b")
    }
}
