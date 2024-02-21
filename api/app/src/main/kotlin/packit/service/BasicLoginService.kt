package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.stereotype.Component
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.LoginWithPassword
import packit.security.provider.JwtIssuer

@Component
class BasicLoginService(
    val jwtIssuer: JwtIssuer,
    val authenticationManager: AuthenticationManager
)
{
    fun authenticateAndIssueToken(loginRequest: LoginWithPassword): Map<String, String>
    {
        if (loginRequest.email.isEmpty() && loginRequest.password.isEmpty())
        {
            throw PackitException("Empty user details", HttpStatus.BAD_REQUEST) // TODO: use a key here
        }

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequest.email,
                loginRequest.password
            )
        )

        // I don't think we need this
        //SecurityContextHolder.getContext().authentication = authentication

        val token = jwtIssuer.issue(authentication)

        return mapOf("token" to token)
    }
}
