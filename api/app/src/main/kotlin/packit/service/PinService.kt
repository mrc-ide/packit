package packit.service

import org.springframework.stereotype.Service
import packit.model.PacketMetadata
import packit.model.Pin
import packit.repository.PinRepository

interface PinService {
    fun findAllPinnedPackets(): List<PacketMetadata>
    fun findPinByPacketId(packetId: String): Pin?
    fun createPinByPacketId(packetId: String): Pin
}

@Service
class BasePinService(
    private val packetService: PacketService,
    private val pinRepository: PinRepository,
) : PinService {
    override fun findAllPinnedPackets(): List<PacketMetadata> {
        val pins = pinRepository.findAll()

        return pins.map { pin ->
            packetService.getMetadataBy(pin.packetId)
        }.sortedByDescending { it.time.start }
    }

    override fun findPinByPacketId(packetId: String): Pin? {
        return pinRepository.findByPacketId(packetId)
    }

    override fun createPinByPacketId(packetId: String): Pin {
        packetService.getPacket(packetId) // Ensure the packet exists

        findPinByPacketId(packetId)?.let {
            return it
        }

        return pinRepository.save(Pin(packetId = packetId))
    }
}
