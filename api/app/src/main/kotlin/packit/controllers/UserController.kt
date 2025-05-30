package packit.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.dto.CreateBasicUser
import packit.model.dto.CreateExternalUser
import packit.model.dto.UpdateUserRoles
import packit.model.dto.UserDto
import packit.model.toDto
import packit.security.profile.UserPrincipal
import packit.service.UserRoleService
import packit.service.UserService
import java.net.URI

@Controller
@PreAuthorize("hasAuthority('user.manage')")
@RequestMapping("/user")
class UserController(
    private val config: AppConfig,
    private val userService: UserService,
    private val userRoleService: UserRoleService
) {
    @PostMapping("/basic")
    fun createBasicUser(
        @RequestBody @Validated createBasicUser: CreateBasicUser
    ): ResponseEntity<UserDto> {
        if (!config.authEnableBasicLogin) {
            throw PackitException("basicLoginDisabled", HttpStatus.FORBIDDEN)
        }

        val user = userService.createBasicUser(createBasicUser)

        return ResponseEntity.created(URI.create("/user/${user.id}")).body(user.toDto())
    }

    @PostMapping("/external")
    fun createExternalUser(@RequestBody @Validated createExternalUser: CreateExternalUser): ResponseEntity<UserDto> {
        if (config.authEnableBasicLogin || !config.authEnabled) {
            throw PackitException("externalLoginDisabled", HttpStatus.FORBIDDEN)
        }

        val user = userService.createExternalUser(createExternalUser, config.authMethod)

        return ResponseEntity.created(URI.create("/user/${user.id}")).body(user.toDto())
    }

    @PutMapping("/{username}/roles")
    fun updateUserRoles(
        @RequestBody @Validated updateUserRoles: UpdateUserRoles,
        @PathVariable username: String
    ): ResponseEntity<UserDto> {
        val updatedUser = userRoleService.updateUserRoles(username, updateUserRoles)

        return ResponseEntity.ok(updatedUser.toDto())
    }

    @DeleteMapping("/{username}")
    fun deleteUser(
        @PathVariable username: String
    ): ResponseEntity<Unit> {
        userService.deleteUser(username)

        return ResponseEntity.noContent().build()
    }

    @GetMapping("/me/authorities")
    @PreAuthorize("isAuthenticated()")
    fun getUserAuthorities(@AuthenticationPrincipal userPrincipal: UserPrincipal): ResponseEntity<List<String>> {
        return ResponseEntity.ok(userPrincipal.authorities.map { it.authority })
    }
}
