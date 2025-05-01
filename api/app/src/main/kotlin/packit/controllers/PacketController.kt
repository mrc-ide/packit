package packit.controllers

import jakarta.servlet.http.HttpServletResponse
import org.springframework.data.domain.Page
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.MediaTypeFactory.getMediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.exceptions.PackitException
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.dto.PacketDto
import packit.model.dto.RolesAndUsersForPacketReadUpdate
import packit.model.dto.UpdateReadRoles
import packit.model.toDto
import packit.service.PacketService
import packit.service.RoleService
import packit.service.UserRoleService

@RestController
@RequestMapping("/packets")
class PacketController(
    private val packetService: PacketService,
    private val roleService: RoleService,
    private val userRoleService: UserRoleService
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

    @GetMapping("/{id}/file")
    @PreAuthorize("@authz.canReadPacket(#root, #id)")
    fun streamFile(
        @PathVariable id: String,
        @RequestParam hash: String,
        @RequestParam inline: Boolean = false,
        @RequestParam filename: String,
        response: HttpServletResponse
    )
    {
        val packet = packetService.getMetadataBy(id)
        if (packet.files.none { it.hash == hash })
        {
            throw PackitException("doesNotExist", HttpStatus.NOT_FOUND)
        }

        val disposition = if (inline) ContentDisposition.inline() else ContentDisposition.attachment()
        response.contentType = getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM).toString()
        response.setHeader("Content-Disposition", disposition.filename(filename).build().toString())

        packetService.getFileByHash(hash, response.outputStream) { outpackResponse ->
            response.setContentLengthLong(outpackResponse.headers.contentLength)
        }
    }

    @GetMapping("/{id}/zip")
    @PreAuthorize("@authz.canReadPacket(#root, #id)")
    fun streamZip(
        @PathVariable id: String,
        @RequestParam paths: List<String>,
        response: HttpServletResponse
    )
    {
        response.contentType = "application/zip"
        response.setHeader(
            "Content-Disposition",
            ContentDisposition.attachment().filename("$id.zip").build().toString()
        )

        packetService.streamZip(paths, id, response.outputStream)
    }

    @PreAuthorize(
        "@authz.canUpdatePacketReadRoles(#root, #id)"
    )
    @GetMapping("{id}/read-permission")
    fun getRolesAndUsersForReadPermissionUpdate(
        @PathVariable id: String,
    ): ResponseEntity<RolesAndUsersForPacketReadUpdate>
    {
        val packet = packetService.getPacket(id)
        val result = userRoleService.getRolesAndUsersForPacketReadUpdate(packet)

        return ResponseEntity.ok(result)
    }

    @PreAuthorize(
        "@authz.canUpdatePacketReadRoles(#root, #id)"
    )
    @PutMapping("/{id}/read-permission")
    fun updatePacketReadPermissionOnRoles(
        @RequestBody @Validated updatePacketReadRoles: UpdateReadRoles, @PathVariable id: String
    ): ResponseEntity<Unit>
    {
        val packet = packetService.getPacket(id)

        roleService.updatePacketReadPermissionOnRoles(updatePacketReadRoles, packet.name, packet.id)

        return ResponseEntity.noContent().build()
    }
}
