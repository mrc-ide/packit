package packit.controllers

import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.Page
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import packit.exceptions.PackitException
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.dto.PacketDto
import packit.model.toDto
import packit.service.PacketService

@RestController
@RequestMapping("/packets")
class PacketController(private val packetService: PacketService)
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

    @GetMapping("/{id}")
    @PreAuthorize("@authz.canReadPacket(#root, #id)")
    fun findPacketMetadata(@PathVariable id: String): ResponseEntity<PacketMetadata>
    {
        return ResponseEntity.ok(packetService.getMetadataBy(id))
    }

    @GetMapping("/{id}/file")
    @PreAuthorize("@authz.canReadPacket(#root, #id)")
    fun findFile(
        @PathVariable id: String,
        @RequestParam hash: String,
        @RequestParam inline: Boolean = false,
        @RequestParam filename: String,
    ): ResponseEntity<ByteArrayResource>
    {
        val packet = packetService.getMetadataBy(id)
        if (packet.files.none { it.hash == hash }) {
            throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
        }

        val response = packetService.getFileByHash(hash, inline, filename)
        return ResponseEntity
            .ok()
            .headers(response.second)
            .body(response.first)
    }

    @GetMapping("/{id}/zip")
    @PreAuthorize("@authz.canReadPacket(#root, #id)")
    fun streamZip(
        @PathVariable id: String,
        @RequestParam paths: List<String>,
        response: HttpServletResponse
    ) {
        response.contentType = "application/zip"
        response.setHeader("Content-Disposition", "attachment; filename=$id.zip")

        packetService.streamZip(paths, id, response.outputStream)
    }
}
