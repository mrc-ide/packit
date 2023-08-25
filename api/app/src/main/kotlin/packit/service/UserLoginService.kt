package packit.service

import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import packit.model.LoginRequest
import packit.security.issuer.JwtIssuer
import packit.security.profile.UserPrincipal

interface LoginService
{
    fun authenticateAndIssueToken(loginRequest: LoginRequest): String
}

@Service
class UserLoginService(
    val jwtIssuer: JwtIssuer,
    val authenticationManager: AuthenticationManager,
) : LoginService
{
    override fun authenticateAndIssueToken(loginRequest: LoginRequest): String
    {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequest.email,
                loginRequest.password
            )
        )

        SecurityContextHolder.getContext().authentication = authentication

        val userPrincipal = authentication.principal as UserPrincipal

        val roles = userPrincipal.authorities
            .map(GrantedAuthority::getAuthority)
            .toList()

        return jwtIssuer.issue(userPrincipal.username, roles)
    }
}
