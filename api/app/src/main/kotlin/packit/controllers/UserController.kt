package packit.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.dto.CreateBasicUser
import packit.model.dto.UserDto
import packit.model.toDto
import packit.service.UserService
import java.net.URI

@Controller
@PreAuthorize("hasAuthority('user.manage')")
@RequestMapping("/user")
class UserController(private val config: AppConfig, private val userService: UserService)
{
    @PostMapping("/basic")
    fun createBasicUser(
        @RequestBody @Validated createBasicUser: CreateBasicUser
    ): ResponseEntity<UserDto?>
    {
        if (!config.authEnableBasicLogin)
        {
            throw PackitException("basicLoginDisabled", HttpStatus.FORBIDDEN)
        }

        val user = userService.createBasicUser(createBasicUser)

        return ResponseEntity.created(URI.create("/user/${user.id}")).body(user.toDto())
    }

    @PutMapping("add-roles/{username}")
    fun addRolesToUser(
        @RequestBody @Validated roleNames: List<String>,
        @PathVariable username: String
    ): ResponseEntity<UserDto>
    {
        val updatedUser = userService.addRolesToUser(username, roleNames)

        return ResponseEntity.ok(updatedUser.toDto())
    }

    @PutMapping("remove-roles/{username}")
    fun removeRolesFromUser(
        @RequestBody @Validated roleNames: List<String>,
        @PathVariable username: String
    ): ResponseEntity<Unit>
    {
        userService.removeRolesFromUser(username, roleNames)

        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{username}")
    fun deleteUser(
        @PathVariable username: String
    ): ResponseEntity<Unit>
    {
        userService.deleteUser(username)

        return ResponseEntity.noContent().build()
    }
}
