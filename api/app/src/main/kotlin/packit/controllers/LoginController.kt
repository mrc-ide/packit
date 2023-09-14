package packit.controllers

import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.util.UriComponentsBuilder
import packit.AppConfig
import packit.model.LoginRequest
import packit.service.UserLoginService
import java.net.URI


@RestController
@RequestMapping("/auth")
class LoginController(val loginService: UserLoginService)
{
    @PostMapping("/login")
    fun login(
        @RequestBody @Validated user: LoginRequest,
        response: HttpServletResponse,
        config: AppConfig,
    )
    {
        val token = loginService.authenticateAndIssueToken(user)

        val uri = UriComponentsBuilder
            .fromUriString(config.authRedirectUri)
            .queryParam("token", token)
            .build()
            .toUriString()

        response.sendRedirect(uri)

        //return ResponseEntity.ok(token)
    }
}
