package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.LoginWithGithubToken
import packit.security.oauth2.GithubAuthentication
import packit.security.provider.JwtIssuer

@Component
class GithubAPILoginService(
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val githubUserClient: GithubUserClient
)
{
    fun authenticateAndIssueToken(loginRequest: LoginWithGithubToken): Map<String, String>
    {
        if (loginRequest.githubtoken.isEmpty())
        {
            throw PackitException("emptyGitToken", HttpStatus.BAD_REQUEST)
        }

        githubUserClient.authenticate(loginRequest.githubtoken)
        githubUserClient.checkGithubMembership()
        val userPrincipal = githubUserClient.getUser()

        // TODO add user to db if not already there

        val authentication = GithubAuthentication(userPrincipal, listOf())

        val token = jwtIssuer.issue(authentication)

        return mapOf("token" to token)
    }
}
