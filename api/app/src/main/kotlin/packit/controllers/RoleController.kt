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
import packit.model.dto.UpdateRolePermissions
import packit.service.RoleService

@Controller
@PreAuthorize("hasAuthority('user.manage')")
@RequestMapping("/role")
class RoleController(private val roleService: RoleService)
{
    @PostMapping()
    fun createRole(@RequestBody @Validated createRole: CreateRole): ResponseEntity<Map<String, String?>>
    {
        roleService.createRole(createRole)

        return ResponseEntity.ok(mapOf("message" to "Role created"))
    }

    @DeleteMapping("/{roleName}")
    fun deleteRole(
        @PathVariable roleName: String
    ): ResponseEntity<Map<String, String?>>
    {
        roleService.deleteRole(roleName)

        return ResponseEntity.noContent().build()
    }

    @PutMapping("/update-permissions/{roleName}")
    fun updatePermissionsToRole(
        @RequestBody @Validated updateRolePermissions: UpdateRolePermissions,
        @PathVariable roleName: String
    ): ResponseEntity<Unit>
    {
        roleService.updatePermissionsToRole(roleName, updateRolePermissions)

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
        val roles = roleService.getRoles(isUsername)
        return ResponseEntity.ok(roles.map { it.toDto() })
    }

    @GetMapping("/{roleName}")
    fun getRole(@PathVariable roleName: String): ResponseEntity<RoleDto>
    {
        val role = roleService.getRole(roleName)
        return ResponseEntity.ok(role.toDto())
    }
}
