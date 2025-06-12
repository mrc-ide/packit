package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.PacketMetadata
import packit.service.PinService

@RestController
@RequestMapping("/pins")
class PinController(
    private val pinService: PinService,
) {
    @GetMapping("/packets")
    fun getPinnedPackets(): ResponseEntity<List<PacketMetadata>> {
        return ResponseEntity.ok(pinService.findAllPinnedPackets())
    }
}
