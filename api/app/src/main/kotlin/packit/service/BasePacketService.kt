package packit.service

import org.springframework.stereotype.Service
import packit.model.Packet
import packit.repository.PacketRepository

interface PacketService
{
    fun getPackets(): List<Packet>
}

@Service
class BasePacketService(private val packetRepository: PacketRepository) : PacketService
{
    override fun getPackets(): List<Packet>
    {
        return packetRepository.findAll()
    }
}
