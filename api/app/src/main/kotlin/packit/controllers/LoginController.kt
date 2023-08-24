package packit.controllers

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.LoginRequest
import packit.model.LoginResponse

@RestController
@RequestMapping("/auth")
class LoginController
{
    @GetMapping("/login")
    fun login(@RequestBody request: LoginRequest): LoginResponse
    {
        return LoginResponse("access token")
    }
}