package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.PacketMetadata
import packit.repository.PinRepository
import packit.service.PacketService

@RestController
@RequestMapping("/pins")
class PinController(
    private val packetService: PacketService,
    private val pinRepository: PinRepository
) {
    @GetMapping("/packets")
    fun getPinnedPackets(): ResponseEntity<List<PacketMetadata>> {
        val pins = pinRepository.findAll()

        val packets = pins.map { pin ->
            packetService.getMetadataBy(pin.packetId)
        }.sortedByDescending { it.time.start }

        return ResponseEntity.ok(packets)
    }
}
