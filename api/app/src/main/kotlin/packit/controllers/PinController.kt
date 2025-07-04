package packit.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.PacketMetadata
import packit.model.dto.PinDto
import packit.model.toDto
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

    @PreAuthorize("@authz.hasGlobalPacketManagePermission(#root)")
    @PostMapping()
    fun pinPacket(@RequestBody packetId: String): ResponseEntity<PinDto> {
        val foundPin = pinService.findPinByPacketId(packetId)
        if (foundPin != null) {
            return ResponseEntity(foundPin.toDto(), HttpStatus.OK)
        }

        val pin = pinService.createPinByPacketId(packetId)

        return ResponseEntity(pin.toDto(), HttpStatus.CREATED)
    }
}
