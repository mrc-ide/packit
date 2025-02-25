package packit.controllers

import jakarta.servlet.http.HttpServletResponse
import org.springframework.data.domain.Page
import org.springframework.http.*
import org.springframework.http.MediaTypeFactory.getMediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.OneTimeTokenDto
import packit.model.dto.PacketDto
import packit.service.OneTimeTokenService
import packit.service.PacketService
import java.util.*

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

    @GetMapping("/{id}/files")
    fun streamFiles(
        @PathVariable id: String,
        @RequestParam paths: List<String>, // To identify which files to download
        @RequestParam token: UUID,
        @RequestParam filename: String, // The suggested name for the client to use when saving the file
        @RequestParam inline: Boolean = false,
        response: HttpServletResponse
    ) {
        oneTimeTokenService.validateToken(token, id, paths)

        val disposition = if (inline) ContentDisposition.inline() else ContentDisposition.attachment()
        response.setHeader("Content-Disposition", disposition.filename(filename).build().toString())

        if (paths.size == 1) {
            response.contentType = getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM).toString()
            packetService.getFileByPath(id, paths[0], response.outputStream) { outpackResponse ->
                response.setContentLengthLong(outpackResponse.headers.contentLength)
            }
        } else if (!inline) {
            response.contentType = "application/zip"
            packetService.streamZip(paths, id, response.outputStream)
        } else {
            throw PackitException("inlineDownloadNotSupported", HttpStatus.BAD_REQUEST)
        }
    }
}
