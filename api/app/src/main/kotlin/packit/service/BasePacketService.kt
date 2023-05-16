package packit.service

import org.springframework.stereotype.Service
import packit.model.Packet
import packit.repository.PacketRepository
import java.security.MessageDigest

interface PacketService
{
    fun getPackets(): List<Packet>
    fun getChecksum(): String
}

@Service
class BasePacketService(private val packetRepository: PacketRepository) : PacketService
{
    override fun getPackets(): List<Packet>
    {
        return packetRepository.findAll()
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
}
