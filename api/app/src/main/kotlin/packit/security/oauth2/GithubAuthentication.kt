package packit.security.oauth2

import org.springframework.security.core.Authentication
import packit.security.profile.UserPrincipal

class GithubAuthentication(
    private val userPrincipal: UserPrincipal,
    private val organizations: List<String>
) : Authentication {
    override fun getAuthorities() = userPrincipal.authorities

    override fun getCredentials() = organizations

    override fun getDetails() = userPrincipal

    override fun getPrincipal() = userPrincipal

    override fun isAuthenticated(): Boolean = true

    override fun getName() = userPrincipal.name

    override fun setAuthenticated(isAuthenticated: Boolean) {
        throw UnsupportedOperationException("GithubAuthentication is always authenticated")
    }
}
