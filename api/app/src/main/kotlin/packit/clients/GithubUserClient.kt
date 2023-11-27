package packit.clients

import org.springframework.stereotype.Component
import org.springframework.http.HttpStatus
import org.kohsuke.github.*
import packit.AppConfig
import packit.exceptions.PackitAuthenticationException
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
            1L,
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
            throw PackitAuthenticationException("githubUserRestrictedAccess", HttpStatus.UNAUTHORIZED)
        }
    }

    private fun checkAuthenticated()
    {
        checkNotNull(ghUser) { "User has not been authenticated" }
    }

    private fun connectToClient(token: String)
    {
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
        val errorCode = if (e.responseCode == HttpStatus.UNAUTHORIZED.value())
            "githubTokenInsufficientPermissions"
        else
            "githubTokenUnexpectedError"
        return PackitAuthenticationException(errorCode, HttpStatus.valueOf(e.responseCode))
    }
}