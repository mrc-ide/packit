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
import packit.repository.PacketRepository

interface PacketGroupService
{
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
}

@Service
class BasePacketGroupService(
    private val packetGroupRepository: PacketGroupRepository,
) : PacketGroupService
{
    override fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    {
        val packetGroups = packetGroupRepository.findAllByNameContaining(filteredName, Sort.by("name"))
        return PagingHelper.convertListToPage(packetGroups, pageablePayload)
    }
}
