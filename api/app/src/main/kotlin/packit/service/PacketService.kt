package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.client.ClientHttpResponse
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.helpers.PagingHelper
import packit.model.FileMetadata
import packit.model.Packet
import packit.model.PacketGroup
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import java.io.OutputStream
import java.security.MessageDigest
import java.time.Instant
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

interface PacketService {
    fun getPacket(id: String): Packet
    fun getPackets(): List<Packet>
    fun getPackets(ids: List<String>): List<Packet>
    fun getPackets(pageablePayload: PageablePayload, filterName: String, filterId: String): Page<Packet>
    fun getChecksum(): String
    fun importPackets()
    fun getMetadataBy(id: String): PacketMetadata
    fun getFileByPath(
        packetId: String,
        path: String,
        output: OutputStream,
        preStream: (ClientHttpResponse) -> Unit = {}
    )
    fun getPacketsByName(
        name: String
    ): List<Packet>

    fun streamZip(paths: List<String>, id: String, output: OutputStream)
    fun validateFilesExistForPacket(id: String, paths: List<String>): List<FileMetadata>
}

@Service
class BasePacketService(
    private val packetRepository: PacketRepository,
    private val packetGroupRepository: PacketGroupRepository,
    private val outpackServerClient: OutpackServer,
) : PacketService {
    override fun importPackets() {
        val mostRecent = packetRepository.findTopByOrderByImportTimeDesc()?.importTime
        val now = Instant.now().epochSecond.toDouble()
        val packets = outpackServerClient.getMetadata(mostRecent)
            .map {
                Packet(
                    it.id, it.name, it.name,
                    it.parameters ?: mapOf(), now,
                    it.time.start, it.time.end
                )
            }
        val packetGroupNames = packets.groupBy { it.name }
            .map { it.key }

        packetRepository.saveAll(packets)
        saveUniquePacketGroups(packetGroupNames)
    }

    internal fun saveUniquePacketGroups(packetGroupNames: List<String>) {
        val matchedPacketGroupNames = packetGroupRepository.findByNameIn(packetGroupNames).map { it.name }
        val newPacketGroups =
            packetGroupNames.filter { it !in matchedPacketGroupNames }
        packetGroupRepository.saveAll(newPacketGroups.map { PacketGroup(name = it) })
    }

    override fun getPacketsByName(name: String): List<Packet> {
        return packetRepository.findByName(name, Sort.by("startTime").descending())
    }

    override fun getPacket(id: String): Packet {
        return packetRepository.findById(id)
            .orElseThrow { PackitException("packetNotFound", HttpStatus.NOT_FOUND) }
    }

    override fun getPackets(): List<Packet> {
        return packetRepository.findAll()
    }

    override fun getPackets(ids: List<String>): List<Packet> {
        return packetRepository.findAllById(ids)
    }

    override fun getPackets(pageablePayload: PageablePayload, filterName: String, filterId: String): Page<Packet> {
        val packets = packetRepository.findAllByNameContainingAndIdContaining(
            filterName,
            filterId,
            Sort.by("startTime").descending()
        )

        return PagingHelper.convertListToPage(packets, pageablePayload)
    }

    override fun getChecksum(): String {
        return packetRepository.findAllIds()
            .joinToString("")
            .toSHA256()
    }

    override fun validateFilesExistForPacket(id: String, paths: List<String>): List<FileMetadata> {
        val metadataFiles = getMetadataBy(id).files
        val notFoundPaths = paths.filter { path -> metadataFiles.none { it.path == path } }

        if (notFoundPaths.isNotEmpty()) {
            throw PackitException("notAllFilesFound", HttpStatus.BAD_REQUEST)
        }

        if (paths.isEmpty()) {
            throw PackitException("noFilesProvided", HttpStatus.BAD_REQUEST)
        }

        return metadataFiles
    }

    private fun String.toSHA256(): String {
        return "sha256:${
        MessageDigest
            .getInstance("SHA-256")
            .digest(this.toByteArray()).toHex()
        }"
    }

    private fun ByteArray.toHex(): String {
        return this.joinToString("") { "%02x".format(it) }
    }

    override fun streamZip(paths: List<String>, id: String, output: OutputStream) {
        val files = validateFilesExistForPacket(id, paths)
        val hashesByPath = files
            .filter { it.path in paths }
            .associateBy({ it.path }, { it.hash })

        try {
            ZipOutputStream(output).use { zipOutputStream ->
                hashesByPath.forEach { (filename, hash) ->
                    zipOutputStream.putNextEntry(ZipEntry(filename))
                    outpackServerClient.getFileByHash(hash, zipOutputStream)
                    zipOutputStream.closeEntry()
                }
            }
        } catch (e: Exception) {
            // Log error on the back end (does not affect front end, client just downloads an incomplete file)
            throw PackitException("errorCreatingZip", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    override fun getMetadataBy(id: String): PacketMetadata {
        return outpackServerClient.getMetadataById(id)
            ?: throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
    }

    override fun getFileByPath(
        packetId: String,
        path: String,
        output: OutputStream,
        preStream: (ClientHttpResponse) -> Unit
    ) {
        val files = validateFilesExistForPacket(packetId, listOf(path))
        val hash = files.first { it.path == path }.hash

        outpackServerClient.getFileByHash(hash, output, preStream)
    }
}
