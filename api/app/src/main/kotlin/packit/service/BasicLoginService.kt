package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.model.dto.LoginWithPassword
import packit.security.profile.BasicUserDetails
import packit.security.provider.JwtIssuer

@Component
class BasicLoginService(
    val jwtIssuer: JwtIssuer,
    val authenticationManager: AuthenticationManager,
    val userService: UserService
) {
    fun authenticateAndIssueToken(loginRequest: LoginWithPassword): Map<String, String> {
        if (loginRequest.email.isEmpty() || loginRequest.password.isEmpty()) {
            throw PackitException("emptyCredentials", HttpStatus.BAD_REQUEST)
        }

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequest.email,
                loginRequest.password
            )
        )
        userService.checkAndUpdateLastLoggedIn(loginRequest.email)

        val userDetails = (authentication.principal as BasicUserDetails)
        val token = jwtIssuer.issue(userDetails.user)

        return mapOf("token" to token)
    }
}
