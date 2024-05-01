package packit.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.CreateBasicUser
import packit.service.UserService

@Controller
@PreAuthorize("hasAuthority('user.manage')")
@RequestMapping("/user")
class UserController(private val config: AppConfig, private val userService: UserService)
{
    @PostMapping("/basic")
    fun createBasicUser(
        @RequestBody @Validated createBasicUser: CreateBasicUser
    ): ResponseEntity<Map<String, String?>>
    {
        if (!config.authEnableBasicLogin)
        {
            throw PackitException("basicLoginDisabled", HttpStatus.FORBIDDEN)
        }

        userService.createBasicUser(createBasicUser)

        return ResponseEntity.ok(mapOf("message" to "User created"))
    }
}
