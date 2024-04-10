package packit.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import packit.AppConfig
import packit.model.CreateBasicUser
import packit.security.Role
import packit.service.UserService

@Controller
@RequestMapping("/user")
class UserController(private val config: AppConfig, private val userService: UserService)
{
    @PostMapping("/basic")
    fun createBasicUser(
        @RequestBody @Validated createBasicUser: CreateBasicUser,
        authentication: Authentication,
    ): ResponseEntity<Map<String, String?>>
    {
        if (authentication.authorities.none { it.authority.contains(Role.ADMIN.toString()) })
        {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "Only admins can create users"))
        }
        if (!config.authEnableBasicLogin)
        {
            return ResponseEntity.badRequest().body(mapOf("error" to "Basic login is not enabled"))
        }

        try
        {
            userService.createBasicUser(createBasicUser)
        } catch (e: IllegalArgumentException)
        {
            return ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
        return ResponseEntity.ok(mapOf("message" to "User created"))
    }
}
