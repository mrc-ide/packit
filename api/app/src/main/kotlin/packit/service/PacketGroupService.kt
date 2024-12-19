package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.PacketGroup
import packit.model.PacketGroupDisplay
import packit.model.PageablePayload
import packit.repository.PacketGroupDisplayRepository
import packit.repository.PacketGroupRepository

interface PacketGroupService
{
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    fun getPacketGroupDisplay(name: String): PacketGroupDisplay
}

@Service
class BasePacketGroupService(
    private val packetGroupRepository: PacketGroupRepository,
    private val packetGroupDisplayRepository: PacketGroupDisplayRepository
) : PacketGroupService
{
    override fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    {
        val packetGroups = packetGroupRepository.findAllByNameContaining(filteredName, Sort.by("name"))
        return PagingHelper.convertListToPage(packetGroups, pageablePayload)
    }

    override fun getPacketGroupDisplay(name: String): PacketGroupDisplay {
        return packetGroupDisplayRepository.findByName(name)
            ?: throw PackitException("packetGroupDisplayNotFound", HttpStatus.NOT_FOUND)
    }
}
