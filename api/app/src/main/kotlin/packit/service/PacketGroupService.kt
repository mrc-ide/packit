package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.PacketGroup
import packit.model.PageablePayload
import packit.model.dto.PacketGroupDetail
import packit.model.dto.PacketGroupDetailImpl
import packit.repository.PacketGroupRepository

interface PacketGroupService
{
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    fun getPacketGroupDetail(name: String): PacketGroupDetail
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

    override fun getPacketGroupDetail(name: String): PacketGroupDetail{
        val latestId = packetGroupRepository.findLatestPacketIdForGroup(name)?.id
        val packetGroup = packetGroupRepository.findByName(name)
        if (latestId == null || packetGroup == null) {
            throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
        }
        val packetOrderlyMetadata = packetService.getMetadataBy(latestId).custom?.get("orderly") as? Map<*, *>
        val packetLongDescription = (packetOrderlyMetadata?.get("description") as? Map<*, *>)?.get("long") as? String
        return PacketGroupDetailImpl(latestId, packetGroup.latestDisplayName, packetLongDescription)
    }
}
