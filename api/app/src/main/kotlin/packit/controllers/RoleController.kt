package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.model.dto.CreateRole
import packit.model.dto.RoleDto
import packit.model.dto.UpdateRolePermission
import packit.model.toDto
import packit.service.RoleService
import java.net.URI

@Controller
@PreAuthorize("hasAuthority('user.manage')")
@RequestMapping("/role")
class RoleController(private val roleService: RoleService)
{
    @PostMapping()
    fun createRole(@RequestBody @Validated createRole: CreateRole): ResponseEntity<RoleDto>
    {
        val role = roleService.createRole(createRole)

        return ResponseEntity.created(URI.create("/role/${role.id}")).body(role.toDto())
    }

    @DeleteMapping("/{roleName}")
    fun deleteRole(
        @PathVariable roleName: String
    ): ResponseEntity<Map<String, String?>>
    {
        roleService.deleteRole(roleName)

        return ResponseEntity.noContent().build()
    }

    @PutMapping("/add-permissions/{roleName}")
    fun addPermissionsToRole(
        @RequestBody @Validated addRolePermissions: List<UpdateRolePermission>,
        @PathVariable roleName: String
    ): ResponseEntity<RoleDto?>
    {
        val updatedRole = roleService.addPermissionsToRole(roleName, addRolePermissions)

        return ResponseEntity.ok(updatedRole.toDto())
    }

    @PutMapping("/remove-permissions/{roleName}")
    fun removePermissionsFromRole(
        @RequestBody @Validated removeRolePermissions: List<UpdateRolePermission>,
        @PathVariable roleName: String
    ): ResponseEntity<RoleDto?>
    {
        roleService.removePermissionsFromRole(roleName, removeRolePermissions)

        return ResponseEntity.noContent().build()
    }

    @GetMapping("/names")
    fun getRoleNames(): ResponseEntity<List<String>>
    {
        return ResponseEntity.ok(roleService.getRoleNames())
    }

    @GetMapping
    fun getRolesWithRelationships(@RequestParam isUsername: Boolean?): ResponseEntity<List<RoleDto>>
    {
        val roles = roleService.getAllRoles(isUsername)
        return ResponseEntity.ok(roles.map { it.toDto() })
    }

    @GetMapping("/{roleName}")
    fun getRole(@PathVariable roleName: String): ResponseEntity<RoleDto>
    {
        val role = roleService.getRole(roleName)
        return ResponseEntity.ok(role.toDto())
    }
}
