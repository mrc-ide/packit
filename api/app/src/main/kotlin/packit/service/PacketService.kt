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
    fun getPacketsByName(
        name: String
    ): List<Packet>

    fun getPacket(id: String): Packet
}

@Service
class BasePacketService(
    private val packetRepository: PacketRepository,
    private val packetGroupRepository: PacketGroupRepository,
    private val outpackServerClient: OutpackServer
) : PacketService
{
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

    override fun getPacketsByName(name: String): List<Packet>
    {
        return packetRepository.findByName(name, Sort.by("startTime").descending())
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
