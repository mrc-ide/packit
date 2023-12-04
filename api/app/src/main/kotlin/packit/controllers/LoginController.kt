package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.model.LoginRequest
import packit.model.LoginWithGithubToken
import packit.service.GithubAPILoginService
import packit.service.LoginService

@RestController
@RequestMapping("/auth")
class LoginController(
    val basicLoginService: LoginService,
    val gitApiLoginService: GithubAPILoginService
)
{
    @PostMapping("/login")
    @ResponseBody
    fun login(
        @RequestBody @Validated user: LoginRequest,
    ): ResponseEntity<Map<String, String>>
    {
        val token = basicLoginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

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
        return ResponseEntity.ok(basicLoginService.authConfig())
    }
}
