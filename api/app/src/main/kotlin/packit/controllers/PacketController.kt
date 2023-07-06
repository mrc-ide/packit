package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.File
import packit.model.Packet
import packit.service.PacketService

@RestController
@RequestMapping("/packets")
class PacketController(private val packetService: PacketService)
{
    @GetMapping
    fun index(): ResponseEntity<List<Packet>>
    {
        return ResponseEntity.ok(packetService.getPackets())
    }

    @GetMapping("/{id}")
    fun findPacket(@PathVariable id: String): ResponseEntity<Packet>
    {
        return ResponseEntity.ok(packetService.getPacket(id))
    }

    @GetMapping("/files/artefacts/{id}")
    fun findPacketFiles(@PathVariable id: String): ResponseEntity<List<File>>
    {
        return ResponseEntity.ok(packetService.getArtefacts(id))
    }
}
