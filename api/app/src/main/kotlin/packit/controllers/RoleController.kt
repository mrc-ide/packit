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
@PreAuthorize("hasAuthority('user.manage')")
@RequestMapping("/role")
class RoleController(private val roleService: RoleService, private val userRoleService: UserRoleService)
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
    ): ResponseEntity<Unit>
    {
        roleService.deleteRole(roleName)

        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{roleName}/permissions")
    fun updatePermissionsToRole(
        @RequestBody @Validated updateRolePermissions: UpdateRolePermissions,
        @PathVariable roleName: String
    ): ResponseEntity<RoleDto>
    {
        val updatedRole = roleService.updatePermissionsToRole(roleName, updateRolePermissions)

        return ResponseEntity.ok(updatedRole.toDto())
    }

    @PutMapping("{roleName}/users")
    fun updateUsersToRole(
        @RequestBody @Validated usersToUpdate: UpdateRoleUsers,
        @PathVariable roleName: String
    ): ResponseEntity<RoleDto>
    {
        val updatedRole = userRoleService.updateRoleUsers(roleName, usersToUpdate)

        return ResponseEntity.ok(updatedRole.toDto())
    }

    @GetMapping
    fun getRoles(): ResponseEntity<List<RoleDto>>
    {
        val roles = roleService.getAllRoles().toDto()
        return ResponseEntity.ok(roles)
    }

    @GetMapping("/{roleName}")
    fun getRole(@PathVariable roleName: String): ResponseEntity<RoleDto>
    {
        val role = roleService.getRole(roleName)
        return ResponseEntity.ok(role.toDto())
    }
}
