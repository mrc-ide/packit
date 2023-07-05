package packit.service

import org.springframework.core.io.InputStreamResource
import org.springframework.http.*
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Packet
import packit.model.PacketMetadata
import packit.repository.PacketRepository
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.Instant

interface PacketService
{
    fun getPackets(): List<Packet>
    fun getPacket(id: String): Packet
    fun getChecksum(): String
    fun importPackets()
    fun getMetadataBy(id: String): PacketMetadata
    fun getFileBy(hash: String): Pair<InputStreamResource, HttpHeaders>
}

@Service
class BasePacketService(
        private val packetRepository: PacketRepository,
        private val outpackServerClient: OutpackServer
) : PacketService
{

    override fun importPackets()
    {
        val mostRecent = packetRepository.findTopByOrderByTimeDesc()?.time
        val now = Instant.now().epochSecond
        val packets = outpackServerClient.getMetadata(mostRecent)
                .map {
                    Packet(
                            it.id, it.name, it.name,
                            it.parameters ?: mapOf(), false, now
                    )
                }
        packetRepository.saveAll(packets)
    }

    override fun getPackets(): List<Packet>
    {
        return packetRepository.findAll()
    }

    override fun getPacket(id: String): Packet
    {
        val packet = packetRepository.findById(id)

        if (packet.isEmpty)
        {
            throw PackitException("packetDoesNotExist", HttpStatus.NOT_FOUND)
        }

        return packet.get()
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
    }

    override fun getFileBy(hash: String): Pair<InputStreamResource, HttpHeaders>
    {
        val response = outpackServerClient.getFileBy(hash)

        val stringResponseBody = response.first.toString().toByteArray(StandardCharsets.UTF_8)

        val inputStream = ByteArrayInputStream(stringResponseBody)

        return Pair(InputStreamResource(inputStream), response.second)
    }
}
