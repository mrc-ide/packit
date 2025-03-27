package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.dto.LoginWithToken
import packit.security.provider.JwtIssuer

@Component
class PreAuthenticatedLoginService(
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val userService: UserService,
)
{
    fun saveUserAndIssueToken(username: String, name: String, email: String): Map<String, String>
    {
        if (username.isEmpty())
        {
            throw PackitException("emptyUsername", HttpStatus.BAD_REQUEST)
        }

        var user = userService.savePreauthenticatedUser(username, name, email)
        val token = jwtIssuer.issue(userService.getUserPrincipal(user)

        return mapOf("token" to token)
    }
}
