package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.LoginWithToken
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer

@Component
class GithubAPILoginService(
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val githubUserClient: GithubUserClient,
    val userService: UserService,
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
        val githubUser = githubUserClient.getGithubUser()

        var user = userService.saveUserFromGithub(githubUser.login, githubUser.name, githubUser.email)

        val token = jwtIssuer.issue(
            UserPrincipal(
                user.username,
                user.displayName,
                AuthorityUtils.createAuthorityList(user.userGroups.map { it.role }.toString()),
                mutableMapOf()
            )
        )

        return mapOf("token" to token)
    }

}
