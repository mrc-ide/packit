package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.exceptions.PackitException
import packit.model.LoginRequest
import packit.service.UserLoginService

@RestController
@RequestMapping("/auth")
class LoginController(val loginService: UserLoginService)
{
    @GetMapping("/login")
    fun login(@RequestBody @Validated user: LoginRequest): ResponseEntity<String>
    {
        if (user.email.isEmpty() && user.password.isEmpty())
        {
            throw PackitException("Empty user details")
        }

        val token = loginService.authenticateAndIssueToken(user)

        return ResponseEntity.ok(token)
    }
}
