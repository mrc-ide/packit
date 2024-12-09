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
        val description = orderlyMetadata?.get("description") as? Map<*, *>
        val orderlyDisplayName = description?.get("display") as? String
        return if (!orderlyDisplayName.isNullOrBlank()) {
            orderlyDisplayName
        } else if (packet.custom?.get("display") is String) {
            packet.custom["display"] as String
        } else if (packet.custom?.get("display_name") is Map<*, *>) {
            packet.custom["display_name"] as String
        } else {
            packet.name
        }
    }

    override fun importPackets()
    {
        val mostRecent = packetRepository.findTopByOrderByImportTimeDesc()?.importTime
        val now = Instant.now().epochSecond.toDouble()
        val packets = outpackServerClient.getMetadata(mostRecent)
            .map {
                Packet(
                    it.id, it.name, getDisplayNameForPacket(it),
                    it.parameters ?: mapOf(), false, now,
                    it.time.start, it.time.end
                )
            }
        val packetGroupData = packets.groupBy { it.name }
            .mapValues { entry -> entry.value.sortedByDescending { it.startTime } }
            .mapValues { it.value.first().displayName }

        packetRepository.saveAll(packets)
        saveUniquePacketGroups(packetGroupData)
    }

    internal fun saveUniquePacketGroups(packetGroupData: Map<String, String>)
    {
        val packetGroupNames = packetGroupData.keys.toList()
        val matchedPacketGroups = packetGroupRepository.findByNameIn(packetGroupNames)
        val matchedPacketGroupNames = matchedPacketGroups.map { it.name }
        val newPacketGroups = packetGroupData
            .filterKeys { it !in matchedPacketGroupNames }
            .map { PacketGroup(name = it.key, latestDisplayName = it.value) }
        packetGroupRepository.saveAll(newPacketGroups)
        matchedPacketGroups.map {
            it.latestDisplayName = packetGroupData[it.name]!!
            packetGroupRepository.save(it)
        }
    }

    override fun getPackets(): List<Packet>
    {
        return packetRepository.findAll()
    }

    override fun getPacketGroupSummaries(
        pageablePayload: PageablePayload,
        filter: String
    ): Page<PacketGroupSummary>
    {
        val packetGroupSummaries = packetRepository.getFilteredPacketGroupSummaries(filter)
        return PagingHelper.convertListToPage(packetGroupSummaries, pageablePayload)
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
