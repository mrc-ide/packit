package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.dto.LoginWithToken
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer

@Component
class GithubAPILoginService(
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val githubUserClient: GithubUserClient,
    val userService: UserService,
    val roleService: RoleService
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
                roleService.getGrantedAuthorities(user.roles),
                mutableMapOf()
            )
        )

        return mapOf("token" to token)
    }
}
