package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.model.LoginRequest
import packit.service.LoginService

@RestController
@RequestMapping("/auth")
class LoginController(val loginService: LoginService)
{
    @PostMapping("/login")
    @ResponseBody
    fun login(
        @RequestBody @Validated user: LoginRequest
    ): ResponseEntity<Map<String, String>>
    {
        val token = loginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

    @PostMapping("/login/github/api")
    @ResponseBody
    fun loginWithGithub(
        @RequestBody @Validated user: LoginRequest
    ): ResponseEntity<Map<String, String>>
    {
        val token = loginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

    @GetMapping("/config")
    @ResponseBody
    fun authConfig(): ResponseEntity<Map<String, Any>>
    {
        return ResponseEntity.ok(loginService.authConfig())
    }
}
