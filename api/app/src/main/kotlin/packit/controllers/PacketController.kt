package packit.controllers

import jakarta.servlet.http.HttpServletResponse
import org.springframework.data.domain.Page
import org.springframework.http.*
import org.springframework.http.MediaTypeFactory.getMediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import packit.model.*
import packit.model.dto.OneTimeTokenDto
import packit.model.dto.PacketDto
import packit.service.OneTimeTokenService
import packit.service.PacketService

@RestController
@RequestMapping("/packets")
class PacketController(
    private val packetService: PacketService,
    private val oneTimeTokenService: OneTimeTokenService,
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

    @GetMapping("/{id}")
    @PreAuthorize("@authz.canReadPacket(#root, #id)")
    fun findPacketMetadata(@PathVariable id: String): ResponseEntity<PacketMetadata>
    {
        return ResponseEntity.ok(packetService.getMetadataBy(id))
    }

    @PostMapping("/{id}/files/token")
    @PreAuthorize("@authz.canReadPacket(#root, #id)")
    fun generateTokenForDownloadingFile(
        @PathVariable id: String,
        @RequestParam paths: List<String>,
    ): ResponseEntity<OneTimeTokenDto> {
        packetService.validateFilesExistForPacket(id, paths)
        val oneTimeToken = oneTimeTokenService.createToken(id, paths)
        return ResponseEntity.ok(oneTimeToken.toDto())
    }

    @GetMapping("/{id}/file")
    @PreAuthorize("@authz.oneTimeTokenValid(#root, #id, #path)")
    fun streamFile(
        @PathVariable id: String,
        @RequestParam path: String, // To identify which file to download
        @RequestParam filename: String, // The suggested name for the client to use when saving the file
        @RequestParam inline: Boolean = false,
        response: HttpServletResponse,
    ) {
        val disposition = if (inline) ContentDisposition.inline() else ContentDisposition.attachment()
        response.setHeader("Content-Disposition", disposition.filename(filename).build().toString())
        response.contentType = getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM).toString()
        packetService.getFileByPath(id, path, response.outputStream) { outpackResponse ->
            response.setContentLengthLong(outpackResponse.headers.contentLength)
        }
    }

    @GetMapping("/{id}/files/zip")
    @PreAuthorize("@authz.oneTimeTokenValid(#root, #id, #paths)")
    fun streamFilesZipped(
        @PathVariable id: String,
        @RequestParam paths: List<String>, // To identify which files to download
        @RequestParam filename: String, // The suggested name for the client to use when saving the file
        @RequestParam inline: Boolean = false,
        response: HttpServletResponse,
    ) {
        val disposition = if (inline) ContentDisposition.inline() else ContentDisposition.attachment()
        response.setHeader("Content-Disposition", disposition.filename(filename).build().toString())
        response.contentType = "application/zip"
        packetService.streamZip(paths, id, response.outputStream)
    }
}
