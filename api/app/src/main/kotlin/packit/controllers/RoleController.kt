package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.model.dto.CreateRole
import packit.model.dto.RoleDto
import packit.model.dto.UpdateRolePermissions
import packit.model.dto.UpdateRoleUsers
import packit.model.toDto
import packit.service.RoleService
import packit.service.UserRoleService
import java.net.URI

@Controller
@RequestMapping("/roles")
class RoleController(private val roleService: RoleService, private val userRoleService: UserRoleService)
{
    @PostMapping()
    @PreAuthorize("hasAuthority('user.manage')")
    fun createRole(@RequestBody @Validated createRole: CreateRole): ResponseEntity<RoleDto>
    {
        val role = roleService.createRole(createRole)

        return ResponseEntity.created(URI.create("/roles/${role.id}")).body(role.toDto())
    }

    @DeleteMapping("/{roleName}")
    @PreAuthorize("hasAuthority('user.manage')")
    fun deleteRole(
        @PathVariable roleName: String
    ): ResponseEntity<Unit>
    {
        roleService.deleteRole(roleName)

        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{roleName}/permissions")
    @PreAuthorize("hasAuthority('user.manage')")
    fun updatePermissionsToRole(
        @RequestBody @Validated updateRolePermissions: UpdateRolePermissions,
        @PathVariable roleName: String
    ): ResponseEntity<RoleDto>
    {
        val updatedRole = roleService.updatePermissionsToRole(roleName, updateRolePermissions)

        return ResponseEntity.ok(updatedRole.toDto())
    }

    @PutMapping("/{roleName}/users")
    @PreAuthorize("hasAuthority('user.manage')")
    fun updateUsersToRole(
        @RequestBody @Validated usersToUpdate: UpdateRoleUsers,
        @PathVariable roleName: String
    ): ResponseEntity<RoleDto>
    {
        val updatedRole = userRoleService.updateRoleUsers(roleName, usersToUpdate)

        return ResponseEntity.ok(updatedRole.toDto())
    }

    @GetMapping
    @PreAuthorize("@authz.canReadRoles(#root)")
    fun getRoles(@RequestParam isUsername: Boolean?): ResponseEntity<List<RoleDto>>
    {
        val roles = roleService.getAllRoles(isUsername)

        return ResponseEntity.ok(roleService.getSortedRoleDtos(roles))
    }

    @GetMapping("/{roleName}")
    @PreAuthorize("@authz.canReadRoles(#root)")
    fun getRoleByName(@PathVariable roleName: String): ResponseEntity<RoleDto>
    {
        val role = roleService.getRole(roleName)
        return ResponseEntity.ok(role.toDto())
    }
}
