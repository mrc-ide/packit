package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.PacketGroup
import packit.model.PageablePayload
import packit.model.dto.PacketGroupSummary
import packit.repository.PacketGroupRepository
import packit.security.PermissionChecker

interface PacketGroupService {
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    fun getPacketGroupSummaries(pageablePayload: PageablePayload, filter: String): Page<PacketGroupSummary>
    fun getPacketGroup(id: Int): PacketGroup
    fun getPacketGroupByName(name: String): PacketGroup
    fun getAllPacketGroupsCanManage(): List<PacketGroup>
}

@Service
class BasePacketGroupService(
    private val packetGroupRepository: PacketGroupRepository,
    private val packetService: PacketService,
    private val permissionChecker: PermissionChecker
) : PacketGroupService {
    override fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup> {
        val packetGroups = packetGroupRepository.findAllByNameContaining(filteredName, Sort.by("name"))
        return PagingHelper.convertListToPage(packetGroups, pageablePayload)
    }

    override fun getPacketGroupSummaries(
        pageablePayload: PageablePayload,
        filter: String
    ): Page<PacketGroupSummary> {
        val packetGroupSummaries = packetService.getByNameOrDisplayName(filter)
            .groupBy { it.name }
            .map { (name, packets) ->
                val latestPacket = packets.maxBy { it.startTime }
                PacketGroupSummary(
                    name = name,
                    latestTime = latestPacket.startTime,
                    latestId = latestPacket.id,
                    packetCount = packets.size,
                    latestDisplayName = latestPacket.displayName,
                )
            }
            .sortedByDescending { it.latestTime }

        return PagingHelper.convertListToPage(packetGroupSummaries, pageablePayload)
    }

    override fun getPacketGroup(id: Int): PacketGroup {
        return packetGroupRepository.findById(id)
            .orElseThrow { PackitException("packetGroupNotFound", HttpStatus.NOT_FOUND) }
    }

    override fun getPacketGroupByName(name: String): PacketGroup {
        return packetGroupRepository.findByName(name)
            ?: throw PackitException("packetGroupNotFound", HttpStatus.NOT_FOUND)
    }

    override fun getAllPacketGroupsCanManage(): List<PacketGroup> {
        val allPacketGroups = packetGroupRepository.findAll()
        val authorities = SecurityContextHolder.getContext().authentication.authorities.map { it.authority }

        return if (permissionChecker.canManageAllPackets(authorities)) {
            allPacketGroups
        } else {
            allPacketGroups.filter {
                permissionChecker.hasPacketManagePermissionForGroup(authorities, it.name)
            }
        }
    }
}
