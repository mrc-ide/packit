package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.PacketMetadata
import packit.model.Pin
import packit.repository.PinRepository

interface PinService {
    fun findAllPinnedPackets(): List<PacketMetadata>
    fun createPinByPacketId(packetId: String): Pin
    fun deletePin(packetId: String)
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

    override fun createPinByPacketId(packetId: String): Pin {
        packetService.getPacket(packetId) // Ensure the packet exists

        if (pinRepository.findByPacketId(packetId) != null) {
            throw PackitException("pinAlreadyExists", HttpStatus.BAD_REQUEST)
        }

        return pinRepository.save(Pin(packetId = packetId))
    }

    override fun deletePin(packetId: String) {
        val pin = pinRepository.findByPacketId(packetId)

        if (pin == null) {
            throw PackitException("pinNotFound", HttpStatus.NOT_FOUND)
        }

        pinRepository.delete(pin)
    }
}
