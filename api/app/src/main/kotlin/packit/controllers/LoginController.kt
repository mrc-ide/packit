package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.model.LoginWithGithubToken
import packit.service.GithubAPILoginService

@RestController
@RequestMapping("/auth")
class LoginController(
    val gitApiLoginService: GithubAPILoginService,
    val config: AppConfig
)
{
    @PostMapping("/login/github")
    @ResponseBody
    fun loginWithGithub(
        @RequestBody @Validated user: LoginWithGithubToken,
    ): ResponseEntity<Map<String, String>>
    {
        val token = gitApiLoginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

    @GetMapping("/config")
    @ResponseBody
    fun authConfig(): ResponseEntity<Map<String, Any>>
    {
        val authConfig =  mapOf(
            "enableGithubLogin" to config.authEnableGithubLogin,
            "enableAuth" to config.authEnabled
        )
        return ResponseEntity.ok(authConfig)
    }
}
