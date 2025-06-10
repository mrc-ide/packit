package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.security.provider.JwtIssuer

@Component
class PreAuthenticatedLoginService(
    val jwtIssuer: JwtIssuer,
    val userService: UserService,
) {
    fun saveUserAndIssueToken(username: String, name: String?, email: String?): Map<String, String> {
        if (username.isEmpty()) {
            throw PackitException("emptyUsername", HttpStatus.BAD_REQUEST)
        }

        val user = userService.savePreAuthenticatedUser(username, name, email)
        val token = jwtIssuer.issue(user)

        return mapOf("token" to token)
    }
}
