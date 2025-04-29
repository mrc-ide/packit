package packit.controllers

import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.model.PageablePayload
import packit.model.dto.*
import packit.model.toDto
import packit.service.PacketGroupService
import packit.service.PacketService
import packit.service.RoleService

@Controller
class PacketGroupController(
    private val packetService: PacketService,
    private val packetGroupService: PacketGroupService,
    private val roleService: RoleService,
)
{
    @GetMapping("/packetGroups")
    fun getPacketGroups(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filterName: String,
    ): ResponseEntity<Page<PacketGroupDto>>
    {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(packetGroupService.getPacketGroups(payload, filterName).map { it.toDto() })
    }

    @GetMapping("/packetGroups/{name}/display")
    fun getDisplay(
        @PathVariable name: String
    ): ResponseEntity<PacketGroupDisplay>
    {
        val result = packetGroupService.getPacketGroupDisplay(name)

        return ResponseEntity.ok(result)
    }

    @GetMapping("/packetGroups/{name}/packets")
    fun getPackets(
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

    @PreAuthorize("@authz.canUpdatePacketReadRoles(#root,#name, null)")
    @GetMapping("packetGroups/{name}/read-permission")
    fun getRolesAndUsersForReadPermissionUpdate(
        @PathVariable name: String,
    ): ResponseEntity<RolesToUpdatePacketGroupRead>
    {
        val result = roleService.getRolesAndUsersForReadPermissionUpdate(name)

        return ResponseEntity.ok(result)
    }

    @PreAuthorize(
        "@authz.canUpdatePacketGroupReadRoles(#root,#name)"
    )
    @PutMapping("packetGroups/{name}/read-permission")
    fun updatePacketReadPermissionOnRoles(
        @RequestBody @Validated updatePacketReadRoles: UpdateReadRoles,
        @PathVariable name: String
    ): ResponseEntity<Unit>
    {
        roleService.updatePacketReadPermissionOnRoles(updatePacketReadRoles, name)

        return ResponseEntity.noContent().build()
    }
}
