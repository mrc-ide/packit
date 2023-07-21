package packit.controllers

import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import packit.model.Packet
import packit.model.PacketMetadata
import packit.model.PageablePayload
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

    @GetMapping("/")
    fun index(
        @RequestParam pageNumber: Int,
        @RequestParam pageSize: Int
    ): ResponseEntity<Page<Packet>>
    {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(packetService.getPackets(payload))
    }

    @GetMapping("/metadata/{id}")
    fun findPacketMetadata(@PathVariable id: String): ResponseEntity<PacketMetadata>
    {
        return ResponseEntity.ok(packetService.getMetadataBy(id))
    }

    @GetMapping("/file/{hash}")
    @ResponseBody
    fun findFile(
        @PathVariable hash: String,
        @RequestParam inline: Boolean = false,
        @RequestParam filename: String,
    ): ResponseEntity<ByteArrayResource>
    {
        val response = packetService.getFileByHash(hash, inline, filename)

        return ResponseEntity
            .ok()
            .headers(response.second)
            .body(response.first)
    }
}
