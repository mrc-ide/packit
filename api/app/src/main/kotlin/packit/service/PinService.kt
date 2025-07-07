package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.PacketMetadata
import packit.model.Pin
import packit.repository.PinRepository
import java.util.UUID

interface PinService {
    fun findAllPinnedPackets(): List<PacketMetadata>
    fun createPinByPacketId(packetId: String): Pin
    fun deletePin(pinId: UUID)
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

    override fun deletePin(pinId: UUID) {
        val pin = pinRepository.findById(pinId)
            .orElseThrow { PackitException("pinNotFound", HttpStatus.NOT_FOUND) }

        pinRepository.delete(pin)
    }
}
