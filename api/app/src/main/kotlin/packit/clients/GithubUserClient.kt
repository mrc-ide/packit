package packit.clients

import org.springframework.stereotype.Component
import org.springframework.http.HttpStatus
import org.kohsuke.github.*
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2ErrorCodes
import packit.AppConfig
import packit.model.User
import packit.security.Role
import packit.security.profile.UserPrincipal

@Component
class GithubUserClient(private val config: AppConfig, private val githubBuilder: GitHubBuilder = GitHubBuilder()) {

    private var github: GitHub? = null
    private var ghUser: GHMyself? = null
    private val allowedOrgs = config.authGithubAPIOrgs.split(",")


    fun authenticate(token: String)
    {
        connectToClient(token)
        ghUser = getGitHubUser()
    }

    fun getUser(): UserPrincipal
    {
        checkAuthenticated()
        val ghu = ghUser!!

        val user = User(
            ghu.getId(),
            ghu.login,
            "",
            Role.USER,
            ghu.name ?: "",
            mutableMapOf()
        )
        return UserPrincipal.create(user, mutableMapOf())
    }

    fun checkGithubOrgMembership()
    {
        checkAuthenticated()

        val userOrgs = ghUser!!.allOrganizations.map {org -> org.login}
        val inAllowedOrg = allowedOrgs.any {allowed -> userOrgs.contains(allowed)}

        if (!inAllowedOrg)
        {
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN,
                "User is not in allowed organization. Please contact your administrator.", ""))
        }
    }

    private fun checkAuthenticated()
    {
        checkNotNull(ghUser) { "User has not been authenticated" }
    }

    private fun connectToClient(token: String)
    {
        if (token.isBlank())
        {
            throw OAuth2AuthenticationException(
                OAuth2Error(
                    OAuth2ErrorCodes.INVALID_TOKEN, "Token cannot be blank", ""))
        }

        github = githubBuilder.withOAuthToken(token).build()
    }

    private fun getGitHubUser(): GHMyself
    {
        try
        {
            return github!!.myself
        }
        catch(e: HttpException)
        {
            throw throwOnHttpException(e)
        }
    }

    private fun throwOnHttpException(e: HttpException): Exception
    {
        if (e.responseCode == HttpStatus.UNAUTHORIZED.value())
        {
            // TODO: This might not be an appropriate exception type?
            // Expect different token to be referenced?
            return OAuth2AuthenticationException(
                OAuth2Error(
                    OAuth2ErrorCodes.INVALID_TOKEN, e.message ?: "", ""))
        }
        return e
    }
}