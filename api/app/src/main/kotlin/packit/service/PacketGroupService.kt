package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.PacketGroup
import packit.model.PageablePayload
import packit.model.dto.PacketGroupDisplayDto
import packit.model.dto.toDisplayDto
import packit.repository.PacketGroupRepository

interface PacketGroupService
{
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    fun getPacketGroupDisplay(name: String): PacketGroupDisplayDto
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
    override fun getPacketGroupDisplay(name: String): PacketGroupDisplayDto{
        val packetGroupSummary = packetGroupRepository.getFilteredPacketGroupSummaries(name).firstOrNull()
            ?: throw PackitException("No packets found for group $name", HttpStatus.NOT_FOUND)
        return packetGroupSummary.toDisplayDto()
    }
}
