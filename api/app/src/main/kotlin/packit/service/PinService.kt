package packit.service

import org.springframework.stereotype.Service
import packit.model.PacketMetadata
import packit.repository.PinRepository

interface PinService {
    fun findAllPinnedPackets(): List<PacketMetadata>
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
}
