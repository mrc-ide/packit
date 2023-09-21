package packit.service

import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.LoginRequest
import packit.security.provider.JwtIssuer

interface LoginService
{
    fun authenticateAndIssueToken(loginRequest: LoginRequest): String
    fun authConfig(): Map<String, Any>
}

@Service
class UserLoginService(
    val jwtIssuer: JwtIssuer,
    val authenticationManager: AuthenticationManager,
    val config: AppConfig
) : LoginService
{
    override fun authenticateAndIssueToken(loginRequest: LoginRequest): String
    {
        if (loginRequest.email.isEmpty() && loginRequest.password.isEmpty())
        {
            throw PackitException("Empty user details")
        }

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequest.email,
                loginRequest.password
            )
        )

        SecurityContextHolder.getContext().authentication = authentication

        return jwtIssuer.issue(authentication)
    }

    override fun authConfig(): Map<String, Any>
    {
        return mapOf(
            "enableGithubLogin" to config.authEnableGithubLogin,
            "enableFormLogin" to config.authEnableFormLogin
        )
    }
}
