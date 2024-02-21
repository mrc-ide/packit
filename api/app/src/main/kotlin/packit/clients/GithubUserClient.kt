package packit.clients

import org.kohsuke.github.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.security.core.authority.AuthorityUtils
import packit.AppConfig
import packit.exceptions.PackitAuthenticationException
import packit.security.Role
import packit.security.profile.UserPrincipal

@Component
class GithubUserClient(private val config: AppConfig, private val githubBuilder: GitHubBuilder = GitHubBuilder()) {

    private var github: GitHub? = null
    private var ghUser: GHMyself? = null

    fun authenticate(token: String)
    {
        connectToClient(token)
        ghUser = getGitHubUser()
    }

    fun getUserPrincipal(): UserPrincipal
    {
        checkAuthenticated()
        val ghu = ghUser!!

        val authorities = AuthorityUtils.createAuthorityList(listOf(Role.USER).toString())
        return UserPrincipal(ghu.login, ghu.name, authorities, mutableMapOf())
    }

    @Throws(PackitAuthenticationException::class)
    fun checkGithubMembership()
    {
        checkAuthenticated()

        val userOrg = ghUser!!.allOrganizations.firstOrNull { org -> org.login == config.authGithubAPIOrg }
        var userOK = userOrg != null // Check if user passes in org check

        val allowedTeam = config.authGithubAPITeam
        if (userOK && allowedTeam.isNotEmpty())
        {
            // We've confirmed user is in org, and required team is not empty, so we need to check team membership too
            val team = userOrg!!.teams[allowedTeam] ?: throw PackitAuthenticationException(
                "githubConfigTeamNotInOrg",
                HttpStatus.UNAUTHORIZED
            )
            userOK = ghUser!!.isMemberOf(team) // Check if user passes in team check
        }

        if (!userOK)
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
        val errorCode = if (e.responseCode == HttpStatus.UNAUTHORIZED.value()) {
            "githubTokenInsufficientPermissions"
        }
        else {
            "githubTokenUnexpectedError"
        }
        return PackitAuthenticationException(errorCode, HttpStatus.valueOf(e.responseCode))
    }
}
