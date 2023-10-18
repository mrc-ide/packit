package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.clients.GithubClient
import packit.exceptions.PackitException
import packit.model.LoginWithGithubToken
import packit.model.User
import packit.security.Role
import packit.security.oauth2.GithubAuthentication
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer

@Component
class GithubUserLoginService(
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val githubClient: GithubClient,
)
{
    fun authenticateAndIssueToken(loginRequest: LoginWithGithubToken): Map<String, String>
    {
        if (loginRequest.githubToken.isEmpty())
        {
            throw PackitException("Empty Github personal access token")
        }

        val client = githubClient.build(loginRequest.githubToken)

        val response = client.get<MutableList<Map<String, Any>>>("/user/orgs")

        val organizations = response.body!!

        val allowedOrganizations = config.authGithubAPIOrgs.split(",").toList()

        organizations.removeIf { org -> !allowedOrganizations.contains(org["login"]) }

        if (organizations.isEmpty())
        {
            throw PackitException("githubRestrictedAccess", HttpStatus.FORBIDDEN)
        }

        val orgs = organizations.map { foo -> foo["login"].toString() }

        val userResponse = client.get<Map<String, Any>>("/user")

        val res = userResponse.body!!

        val user = User(
            res["id"].toString().toLong(),
            res["login"].toString(),
            "",
            Role.USER,
            res["name"].toString(),
            mutableMapOf()
        )

        val userPrincipal = UserPrincipal.create(user, mutableMapOf())

        val authentication = GithubAuthentication(userPrincipal, orgs)

        SecurityContextHolder.getContext().authentication = authentication

        val token = jwtIssuer.issue(authentication)

        return mapOf("token" to token)
    }
}
