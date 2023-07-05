package packit.controllers

import org.springframework.core.io.InputStreamResource
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import packit.model.Packet
import packit.model.PacketMetadata
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

    @GetMapping("/metadata/{id}")
    fun findPacket(@PathVariable id: String): ResponseEntity<PacketMetadata>
    {
        return ResponseEntity.ok(packetService.getMetadataBy(id))
    }

    @GetMapping("/file/{hash}")
    @ResponseBody
    fun findFile(@PathVariable hash: String): ResponseEntity<InputStreamResource>
    {
        return ResponseEntity.ok(packetService.getFileBy(hash))
    }
}
