package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.model.LoginWithPassword
import packit.security.profile.BasicUserDetails
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
            throw PackitException("emptyCredentials", HttpStatus.BAD_REQUEST)
        }

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequest.email,
                loginRequest.password
            )
        )

        val userDetails = (authentication.principal as BasicUserDetails)
        val token = jwtIssuer.issue(userDetails.principal)

        return mapOf("token" to token)
    }
}
