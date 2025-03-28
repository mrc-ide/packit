package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.PacketGroup
import packit.model.PageablePayload
import packit.model.dto.PacketGroupDisplay
import packit.model.dto.PacketGroupSummary
import packit.model.dto.toPacketGroupSummary
import packit.repository.PacketGroupRepository
import packit.service.utils.getDescriptionForPacket
import packit.service.utils.getDisplayNameForPacket

interface PacketGroupService
{
    fun getPacketGroups(pageablePayload: PageablePayload, filteredName: String): Page<PacketGroup>
    fun getPacketGroupDisplay(name: String): PacketGroupDisplay
    fun getPacketGroupSummaries(pageablePayload: PageablePayload, filter: String): Page<PacketGroupSummary>
    fun getPacketGroup(id: Int): PacketGroup
}

@Service
class BasePacketGroupService(
    private val packetGroupRepository: PacketGroupRepository,
    private val packetService: PacketService,
    private val outpackServerClient: OutpackServer
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

    /**
     * This function, somewhat inefficiently, applies a filter to metadata from outpack_server, rather than in SQL.
     * This is because we need to filter on the displayName, which is not stored in the database.
     * We intend to move to a more efficient solution once we have made architectural changes: ticket mrc-6153
     */
    override fun getPacketGroupSummaries(
        pageablePayload: PageablePayload,
        filter: String
    ): Page<PacketGroupSummary>
    {
        val allPacketGroups = packetGroupRepository.findAll()
        val packetIds = findLatestPacketIdsForGroups(allPacketGroups.map { it.name })
        val allPacketsMetadata = outpackServerClient.getMetadata()
        // Filter the metadata to include only the packets previously established as being the latest in their group,
        // then, if the name or display name matches the search filter,
        // calculate the packetCount and displayName to generate a PacketGroupSummary.
        val latestPackets = allPacketsMetadata.filter { it.id in packetIds }
            .mapNotNull {
                val display = getDisplayNameForPacket(it.custom, it.name)

                if (it.name.contains(filter, ignoreCase = true) || display.contains(filter, ignoreCase = true))
                {
                    val packetCount = allPacketsMetadata.count { p -> p.name == it.name }
                    it.toPacketGroupSummary(packetCount, display)
                } else
                {
                    null
                }
            }.sortedByDescending { it.latestTime }

        return PagingHelper.convertListToPage(latestPackets, pageablePayload)
    }

    override fun getPacketGroup(id: Int): PacketGroup
    {
        return packetGroupRepository.findById(id)
            .orElseThrow { PackitException("packetGroupNotFound", HttpStatus.NOT_FOUND) }
    }

    /**
     * Find the id of the latest packet per group, excluding cases where the user does not have access.
     *
     * @param names The names of the packet groups.
     * @return For each group, an id of the latest packet in the group.
     */
    private fun findLatestPacketIdsForGroups(names: List<String>): List<String>
    {
        return names.mapNotNull {
            try
            {
                packetGroupRepository.findLatestPacketIdForGroup(it)?.id
            } catch (e: AccessDeniedException)
            {
                null
            }
        }
    }
}
