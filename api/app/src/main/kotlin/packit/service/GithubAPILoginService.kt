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
class GithubAPILoginService(
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val githubUserClient: GithubUserClient
)
{
    fun authenticateAndIssueToken(loginRequest: LoginWithToken): Map<String, String>
    {
        if (loginRequest.token.isEmpty())
        {
            throw PackitException("emptyGitToken", HttpStatus.BAD_REQUEST)
        }

        githubUserClient.authenticate(loginRequest.token)
        githubUserClient.checkGithubMembership()
        val userPrincipal = githubUserClient.getUserPrincipal()

        // TODO add user to db if not already there

        val token = jwtIssuer.issue(userPrincipal)

        return mapOf("token" to token)
    }
}
