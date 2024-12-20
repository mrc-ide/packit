package packit.service

import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import packit.contentTypes
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.Packet
import packit.model.PacketGroup
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.dto.OutpackMetadata
import packit.model.dto.PacketGroupSummary
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import java.security.MessageDigest
import java.time.Instant

interface PacketService
{
    fun getPackets(pageablePayload: PageablePayload, filterName: String, filterId: String): Page<Packet>
    fun getPackets(): List<Packet>
    fun getChecksum(): String
    fun importPackets()
    fun getMetadataBy(id: String): PacketMetadata
    fun getFileByHash(hash: String, inline: Boolean, filename: String): Pair<ByteArrayResource, HttpHeaders>
    fun getPacketGroupSummaries(pageablePayload: PageablePayload, filter: String): Page<PacketGroupSummary>
    fun getPacketsByName(
        name: String, payload: PageablePayload
    ): Page<Packet>

    fun getPacket(id: String): Packet
}

@Service
class BasePacketService(
    private val packetRepository: PacketRepository,
    private val packetGroupRepository: PacketGroupRepository,
    private val outpackServerClient: OutpackServer
) : PacketService
{
    /**
     * Return the long description for a packet assuming its custom metadata schema conforms to the orderly schema.
     *
     * @param packet The packet metadata.
     * @return The description for the packet.
     */
    private fun getDescriptionForPacket(packet: OutpackMetadata): String? {
        val orderlyMetadata = packet.custom?.get("orderly") as? Map<*, *>
        return (orderlyMetadata?.get("description") as? Map<*, *>)?.get("long") as? String
    }

    /**
     * Check for 'display name' keys that may exist in non-orderly outpack custom schemas.
     *
     * @param packet The packet metadata.
     * @return The display name for the packet.
     */
    private fun getOutpackPacketDisplayName(packet: OutpackMetadata): String? {
        return packet.custom?.values
            ?.filterIsInstance<Map<*, *>>()
            ?.firstNotNullOfOrNull { (it["display_name"] as? String) ?: (it["display"] as? String) }
    }

    /**
     * Return the display name for a packet if its custom metadata schema conforms to the orderly schema and contains
     * a display name.
     * Also check for 'display name' keys that may exist in non-orderly outpack custom schemas.
     * Falls back to name if no display name.
     *
     * @param packet The packet metadata.
     * @return The display name for the packet.
     */
    private fun getDisplayNameForPacket(packet: OutpackMetadata): String {
        val orderlyMetadata = packet.custom?.get("orderly") as? Map<*, *>
        val orderlyDisplayName = (orderlyMetadata?.get("description") as? Map<*, *>)?.get("display") as? String
        return orderlyDisplayName?.takeIf { it.isNotBlank() }
            ?: getOutpackPacketDisplayName(packet)
            ?: packet.name
    }

    override fun importPackets()
    {
        val mostRecent = packetRepository.findTopByOrderByImportTimeDesc()?.importTime
        val now = Instant.now().epochSecond.toDouble()
        val packets = outpackServerClient.getMetadata(mostRecent)
            .map {
                Packet(
                    it.id, it.name, it.name,
                    it.parameters ?: mapOf(), false, now,
                    it.time.start, it.time.end
                )
            }
        val packetGroupNames = packets.groupBy { it.name }
            .map { it.key }

        packetRepository.saveAll(packets)
        saveUniquePacketGroups(packetGroupNames)
    }

    internal fun saveUniquePacketGroups(packetGroupNames: List<String>)
    {
        val matchedPacketGroupNames = packetGroupRepository.findByNameIn(packetGroupNames).map { it.name }
        val newPacketGroups =
            packetGroupNames.filter { it !in matchedPacketGroupNames }
        packetGroupRepository.saveAll(newPacketGroups.map { PacketGroup(name = it) })
    }

    override fun getPackets(): List<Packet>
    {
        return packetRepository.findAll()
    }

    /**
     * This function, somewhat inefficiently, applies a filter to metadata from outpack_server, rather than in SQL.
     * This is because we need to filter on the displayName, which is not stored in the database.
     * We intend to move to a more efficient solution in the future once we have made architectural changes.
     */
    override fun getPacketGroupSummaries(
        pageablePayload: PageablePayload,
        filter: String
    ): Page<PacketGroupSummary>
    {
        // For each packet group in the database, get the id of the latest packet in the group.
        val allPacketGroups = packetGroupRepository.findAll()
        val packetIds = allPacketGroups.map { packetGroupRepository.findLatestPacketIdForGroup(it.name)?.id }

        val allPacketsMetadata = outpackServerClient.getMetadata()
        val allPacketNames = allPacketsMetadata.map { it.name }
        // Filter to the latest packet for each group, then, if the name or display name matches the search filter,
        // calculate the packetCount, displayName and description to generate a PacketGroupSummary.
        val latestPackets = allPacketsMetadata.filter({ it.id in packetIds })
            .mapNotNull {
                val displayName = getDisplayNameForPacket(it)

                if (it.name.contains(filter, ignoreCase = true) ||
                    displayName.contains(filter, ignoreCase = true)) {
                    object : PacketGroupSummary {
                        override fun getName(): String = it.name
                        override fun getPacketCount(): Int = allPacketNames.count { name -> name == it.name }
                        override fun getLatestId(): String = it.id
                        override fun getLatestTime(): Double = it.time.start
                        override fun getLatestDisplayName(): String = displayName
                        override fun getLatestDescription(): String? = getDescriptionForPacket(it)
                    }
                } else {
                    null
                }
            }

        return PagingHelper.convertListToPage(latestPackets, pageablePayload)
    }

    override fun getPacketsByName(name: String, payload: PageablePayload): Page<Packet>
    {
        val packets = packetRepository.findByName(name, Sort.by("startTime").descending())
        return PagingHelper.convertListToPage(packets, payload)
    }

    override fun getPacket(id: String): Packet
    {
        return packetRepository.findById(id)
            .orElseThrow { PackitException("doesNotExist", HttpStatus.NOT_FOUND) }
    }

    override fun getPackets(pageablePayload: PageablePayload, filterName: String, filterId: String): Page<Packet>
    {
        val packets = packetRepository.findAllByNameContainingAndIdContaining(
            filterName,
            filterId,
            Sort.by("startTime").descending()
        )

        return PagingHelper.convertListToPage(packets, pageablePayload)
    }

    override fun getChecksum(): String
    {
        return packetRepository.findAllIds()
            .joinToString("")
            .toSHA256()
    }

    private fun String.toSHA256(): String
    {
        return "sha256:${
            MessageDigest
                .getInstance("SHA-256")
                .digest(this.toByteArray()).toHex()
        }"
    }

    private fun ByteArray.toHex(): String
    {
        return this.joinToString("") { "%02x".format(it) }
    }

    override fun getMetadataBy(id: String): PacketMetadata
    {
        return outpackServerClient.getMetadataById(id)
            ?: throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
    }

    override fun getFileByHash(hash: String, inline: Boolean, filename: String): Pair<ByteArrayResource, HttpHeaders>
    {
        val response = outpackServerClient.getFileByHash(hash)

        if (response?.first == null || response.first.isEmpty())
        {
            throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
        }

        val byteArrayResource = ByteArrayResource(response.first)

        val disposition = if (inline) "inline" else "attachment"

        val extension = filename.substringAfterLast(".")

        val contentMediaType = contentTypes[extension] ?: MediaType.APPLICATION_OCTET_STREAM_VALUE

        val headers = HttpHeaders().apply {
            contentType = MediaType.valueOf(contentMediaType)
            contentDisposition = ContentDisposition.parse("$disposition; filename=$filename")
        }

        return byteArrayResource to headers
    }
}