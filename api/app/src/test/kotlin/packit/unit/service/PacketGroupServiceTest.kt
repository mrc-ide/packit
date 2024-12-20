package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import packit.model.PacketGroup
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.TimeMetadata
import packit.model.dto.PacketGroupDisplayDto
import packit.model.dto.PacketGroupSummary
import packit.repository.PacketGroupRepository
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
    fun `getPacketGroupDisplay returns display name, and description, for a packet group with a given name`() {
        val packetGroupRepository = mock<PacketGroupRepository>()

        val groupName = "namesAreHard"

        val packetGroupSummary = object : PacketGroupSummary {
            override fun getLatestDescription(): String? = "Short description"
            override fun getLatestDisplayName(): String = "Display Name"
            override fun getLatestPacketId(): String = "20170818-164847-7574853b"
            override fun getLatestStartTime(): Double = 0.0
            override fun getName(): String = groupName
            override fun getPacketCount(): Int = 1
            override fun getPacketGroupId(): Int = 1
        }
        whenever(packetGroupRepository.getFilteredPacketGroupSummaries(groupName)).thenReturn(listOf(packetGroupSummary))

        val sut = BasePacketGroupService(packetGroupRepository)

        val result = sut.getPacketGroupDisplay(groupName)

        assertEquals("Display Name", result.latestDisplayName)
        assertEquals("Short description", result.description)
        verify(packetGroupRepository).getFilteredPacketGroupSummaries(groupName)
    }
}
