package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.model.dto.CreateRole
import packit.model.dto.UpdateRolePermission
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

    @PutMapping("/add-permissions/{roleName}")
    fun addPermissionsToRole(
        @RequestBody @Validated addRolePermissions: List<UpdateRolePermission>,
        @PathVariable roleName: String
    ): ResponseEntity<Map<String, String>>
    {
        roleService.addPermissionsToRole(roleName, addRolePermissions)

        return ResponseEntity.ok(mapOf("message" to "Permissions added"))
    }

    @PutMapping("/remove-permissions/{roleName}")
    fun removePermissionsFromRole(
        @RequestBody @Validated removeRolePermissions: List<UpdateRolePermission>,
        @PathVariable roleName: String
    ): ResponseEntity<Map<String, String>>
    {
        roleService.removePermissionsFromRole(roleName, removeRolePermissions)

        return ResponseEntity.ok(mapOf("message" to "Permissions removed"))
    }
}
