package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.Packet
import packit.service.PacketService

@RestController
@RequestMapping("/packet")
class PacketController(private val packetService: PacketService)
{
    @GetMapping("")
    fun index(): ResponseEntity<List<Packet>>
    {
        return ResponseEntity.ok(packetService.getPackets())
    }
}
