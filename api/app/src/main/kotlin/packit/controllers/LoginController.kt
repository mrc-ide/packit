package packit.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.dto.LoginWithPassword
import packit.model.dto.LoginWithToken
import packit.model.dto.UpdatePassword
import packit.service.BasicLoginService
import packit.service.GithubAPILoginService
import packit.service.ServiceLoginService
import packit.service.UserService

@RestController
@RequestMapping("/auth")
class LoginController(
    val gitApiLoginService: GithubAPILoginService,
    val basicLoginService: BasicLoginService,
    val serviceLoginService: ServiceLoginService,
    val config: AppConfig,
    val userService: UserService,
)
{
    @PostMapping("/login/api")
    @ResponseBody
    fun loginWithGithub(
        @RequestBody @Validated user: LoginWithToken,
    ): ResponseEntity<Map<String, String>>
    {
        if (!config.authEnableGithubLogin)
        {
            throw PackitException("githubLoginDisabled", HttpStatus.FORBIDDEN)
        }
        val token = gitApiLoginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

    @PostMapping("/login/basic")
    @ResponseBody
    fun loginBasic(
        @RequestBody @Validated user: LoginWithPassword
    ): ResponseEntity<Map<String, String>>
    {
        if (!config.authEnableBasicLogin)
        {
            throw PackitException("basicLoginDisabled", HttpStatus.FORBIDDEN)
        }
        val token = basicLoginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

    @PostMapping("/login/service")
    @ResponseBody
    fun loginJWT(
        @RequestBody @Validated user: LoginWithToken,
    ): ResponseEntity<Map<String, String>>
    {
        if (!serviceLoginService.isEnabled()) {
            throw PackitException("serviceLoginDisabled", HttpStatus.FORBIDDEN)
        }

        val token = serviceLoginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

    @GetMapping("/login/service/audience")
    @ResponseBody
    fun serviceAudience(): ResponseEntity<Map<String, String>>
    {
        if (!serviceLoginService.isEnabled()) {
            throw PackitException("serviceLoginDisabled", HttpStatus.FORBIDDEN)
        } else {
            return ResponseEntity.ok(mapOf("audience" to serviceLoginService.audience!!))
        }
    }

    @GetMapping("/config")
    @ResponseBody
    fun authConfig(): ResponseEntity<Map<String, Any>>
    {
        val authConfig = mapOf(
            "enableGithubLogin" to config.authEnableGithubLogin,
            "enableBasicLogin" to config.authEnableBasicLogin,
            "enableAuth" to config.authEnabled
        )
        return ResponseEntity.ok(authConfig)
    }

    @PostMapping("/{username}/basic/password")
    fun updatePassword(
        @PathVariable username: String,
        @RequestBody @Validated updatePassword: UpdatePassword
    ): ResponseEntity<Unit>
    {
        if (!config.authEnableBasicLogin)
        {
            throw PackitException("basicLoginDisabled", HttpStatus.FORBIDDEN)
        }

        userService.updatePassword(username, updatePassword)

        return ResponseEntity.noContent().build()
    }
}
