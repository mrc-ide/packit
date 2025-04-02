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
import packit.service.PreAuthenticatedLoginService
import packit.service.ServiceLoginService
import packit.service.UserService

@RestController
@RequestMapping("/auth")
class LoginController(
    val gitApiLoginService: GithubAPILoginService,
    val preAuthenticatedLoginService: PreAuthenticatedLoginService,
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

    // NB This endpoint MUST be protected in the proxy when preauth login is enabled,
    // as headers received by it will be treated as preauthenticated user details.
    @GetMapping("/login/preauth")
    @ResponseBody
    fun loginWithTrustedHeaders(
        @RequestHeader("X-Remote-User") username: String,
        @RequestHeader("X-Remote-Name") name: String,
        @RequestHeader("X-Remote-Email") email: String
    ): ResponseEntity<Map<String, String>>
    {
        println("doing preauth login")
        if (!config.authEnablePreAuthLogin)
        {
            throw PackitException("preauthLoginDisabled", HttpStatus.FORBIDDEN)
        }

        println("username is " + username)
        println("name is " + name)
        println("email is" + email)

        println("getting token")
        val token = preAuthenticatedLoginService.saveUserAndIssueToken(username, name, email)
        println("got token")
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
    fun loginService(
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
            "enablePreAuthLogin" to config.enablePreAuthLogin,
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
