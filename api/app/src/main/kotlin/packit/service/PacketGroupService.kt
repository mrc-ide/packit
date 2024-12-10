package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.PacketGroup
import packit.model.PageablePayload
import packit.model.dto.PacketIdAndDisplayName
import packit.model.dto.PacketIdAndDisplayNameImpl
import packit.repository.PacketGroupRepository

interface PacketGroupService
{
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    fun getLatestIdAndDisplayName(name: String): PacketIdAndDisplayName
}

@Service
class BasePacketGroupService(
    private val packetGroupRepository: PacketGroupRepository
) : PacketGroupService
{
    override fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    {
        val packetGroups = packetGroupRepository.findAllByNameContaining(filteredName, Sort.by("name"))
        return PagingHelper.convertListToPage(packetGroups, pageablePayload)
    }

    override fun getLatestIdAndDisplayName(name: String): PacketIdAndDisplayName{
        val latestId = packetGroupRepository.findLatestPacketIdForGroup(name)?.id
        val packetGroup = packetGroupRepository.findByName(name)
        if (latestId == null || packetGroup == null) {
            throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
        }
        return PacketIdAndDisplayNameImpl(latestId, packetGroup.latestDisplayName)
    }
}
