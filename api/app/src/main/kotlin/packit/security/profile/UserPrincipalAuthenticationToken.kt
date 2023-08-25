package packit.security.profile

import org.springframework.security.authentication.AbstractAuthenticationToken

class UserPrincipalAuthenticationToken(userPrincipal: UserPrincipal) :
    AbstractAuthenticationToken(userPrincipal.authorities)
{
    private val principal = userPrincipal

    init
    {
        isAuthenticated = true
    }

    override fun getCredentials(): Any
    {
        return ""
    }

    override fun getPrincipal(): Any
    {
        return principal
    }
}
