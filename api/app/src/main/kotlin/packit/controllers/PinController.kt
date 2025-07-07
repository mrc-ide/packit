package packit.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.PacketMetadata
import packit.model.dto.PacketPinDto
import packit.model.dto.PinDto
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
    fun pinPacket(
        @RequestBody @Validated packetPin: PacketPinDto,
    ): ResponseEntity<PacketPinDto> {
        val packetId = packetPin.packetId
        val pin = pinService.createPinByPacketId(packetId)

        return ResponseEntity(PacketPinDto(pin.packetId), HttpStatus.CREATED)
    }

    @PreAuthorize("@authz.hasGlobalPacketManagePermission(#root)")
    @DeleteMapping()
    fun deletePacket(
        @RequestBody @Validated pin: PinDto,
    ): ResponseEntity<PinDto> {
        pinService.deletePin(pin.id)

        return ResponseEntity(PinDto(id = pin.id), HttpStatus.OK)
    }
}
