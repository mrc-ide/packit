package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.PacketGroup
import packit.model.PageablePayload
import packit.model.dto.PacketGroupDisplay
import packit.repository.PacketGroupRepository
import packit.service.utils.getDescriptionForPacket
import packit.service.utils.getDisplayNameForPacket

interface PacketGroupService
{
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    fun getPacketGroupDisplay(name: String): PacketGroupDisplay
}

@Service
class BasePacketGroupService(
    private val packetGroupRepository: PacketGroupRepository,
    private val packetService: PacketService
) : PacketGroupService
{
    override fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    {
        val packetGroups = packetGroupRepository.findAllByNameContaining(filteredName, Sort.by("name"))
        return PagingHelper.convertListToPage(packetGroups, pageablePayload)
    }

    override fun getPacketGroupDisplay(name: String): PacketGroupDisplay
    {
        val latestPacketId = packetGroupRepository.findLatestPacketIdForGroup(name)?.id
            ?: throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
        val metadata = packetService.getMetadataBy(latestPacketId)
        val displayName = getDisplayNameForPacket(metadata.custom, metadata.name)
        val description = getDescriptionForPacket(metadata.custom)
        return PacketGroupDisplay(displayName, description)
    }
}
