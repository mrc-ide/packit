package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import packit.model.PacketGroup
import packit.model.PageablePayload
import packit.repository.PacketGroupRepository
import packit.repository.PacketIdProjection
import packit.service.BasePacketGroupService
import kotlin.test.assertEquals

class PacketGroupServiceTest
{
    @Test
    fun `getPacketGroups calls repository with correct params and returns its result`()
    {
        val packetGroupRepository = mock<PacketGroupRepository>()
        val sut = BasePacketGroupService(packetGroupRepository)
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
    fun `getLatestIdAndDisplayName returns correct id and display name`()
    {
        val packetGroupRepository = mock<PacketGroupRepository>()
        val sut = BasePacketGroupService(packetGroupRepository)

        val groupName = "testGroup"
        val packetIdProjection = mock<PacketIdProjection> {
            on { id } doReturn "20170818-164847-7574853b"
        }
        val packetGroup = PacketGroup("testGroup", "Display Name")

        whenever(packetGroupRepository.findLatestPacketIdForGroup(groupName)).thenReturn(packetIdProjection)
        whenever(packetGroupRepository.findByName(groupName)).thenReturn(packetGroup)

        val result = sut.getLatestIdAndDisplayName(groupName)

        assertEquals("20170818-164847-7574853b", result.latestPacketId)
        assertEquals("Display Name", result.displayName)
        verify(packetGroupRepository).findLatestPacketIdForGroup(groupName)
        verify(packetGroupRepository).findByName(groupName)
    }
}
