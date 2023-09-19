package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import packit.model.LoginRequest
import packit.service.UserLoginService

@Controller
@RequestMapping("/auth")
class LoginController(val loginService: UserLoginService)
{
    @PostMapping("/login")
    fun login(
        @RequestBody @Validated user: LoginRequest
    ): ResponseEntity<String>
    {
        val token = loginService.authenticateAndIssueToken(user)
        return ResponseEntity.ok(token)
    }

    @GetMapping("/config")
    fun authConfig(): ResponseEntity<Map<String, Any>>
    {
        return ResponseEntity.ok(loginService.authConfig())
    }
}
