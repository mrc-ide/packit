package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.LoginWithToken
import packit.security.oauth2.GithubAuthentication
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
            throw PackitException("Empty user details", 400) // TODO: use a key here
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
