package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.model.LoginWithPassword
import packit.model.LoginWithToken
import packit.service.BasicLoginService
import packit.service.GithubAPILoginService

@RestController
@RequestMapping("/auth")
class LoginController(
    val gitApiLoginService: GithubAPILoginService,
    val basicLoginService: BasicLoginService,
    val config: AppConfig
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
            return ResponseEntity.badRequest().body(mapOf("error" to "Github login is not enabled"))
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
            return ResponseEntity.badRequest().body(mapOf("error" to "Basic login is not enabled"))
        }
        val token = basicLoginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
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
}
