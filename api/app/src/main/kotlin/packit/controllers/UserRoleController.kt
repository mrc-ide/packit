package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import packit.model.dto.RolesAndUsersWithPermissionsDto
import packit.service.UserRoleService

@Controller
@RequestMapping("/user-role")
@PreAuthorize("hasAuthority('user.manage')")
class UserRoleController(private val userRoleService: UserRoleService)
{
    @GetMapping
    fun getRolesAndUsers(): ResponseEntity<RolesAndUsersWithPermissionsDto>
    {
        val rolesAndUsers = userRoleService.getAllRolesAndUsersWithPermissions()
        return ResponseEntity.ok(rolesAndUsers)
    }
}
