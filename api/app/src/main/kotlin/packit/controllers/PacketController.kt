package packit.controllers

import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.dto.PacketDto
import packit.model.dto.PacketGroupSummary
import packit.model.toDto
import packit.service.PacketGroupService
import packit.service.PacketService

@RestController
@RequestMapping("/packets")
class PacketController(
    private val packetService: PacketService,
    private val packetGroupService: PacketGroupService
)
{
    @GetMapping
    fun pageableIndex(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filterName: String,
        @RequestParam(required = false, defaultValue = "") filterId: String,
    ): ResponseEntity<Page<PacketDto>>
    {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(packetService.getPackets(payload, filterName, filterId).map { it.toDto() })
    }

    @GetMapping("/{name}")
    fun getPacketsByName(
        @PathVariable name: String,
    ): ResponseEntity<List<PacketDto>>
    {
        return ResponseEntity.ok(
            packetService.getPacketsByName(name).map { it.toDto() }
        )
    }

    @GetMapping("/packetGroupSummaries")
    fun getPacketGroupSummaries(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filter: String,
    ): ResponseEntity<Page<PacketGroupSummary>>
    {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(packetGroupService.getPacketGroupSummaries(payload, filter))
    }

    @GetMapping("/metadata/{id}")
    @PreAuthorize("@authz.canReadPacketMetadata(#root, #id)")
    fun findPacketMetadata(@PathVariable id: String): ResponseEntity<PacketMetadata>
    {
        return ResponseEntity.ok(packetService.getMetadataBy(id))
    }

    @GetMapping("/file/{id}")
    @PreAuthorize("@authz.canReadPacketMetadata(#root, #id)")
    @ResponseBody
    fun findFile(
        @PathVariable id: String,
        @RequestParam hash: String,
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
