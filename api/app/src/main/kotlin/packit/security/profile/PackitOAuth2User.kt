package packit.security.profile

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.oauth2.core.user.OAuth2User

class PackitOAuth2User(
    val principal: UserPrincipal
) : OAuth2User
{
    override fun getAttributes(): MutableMap<String, Any>
    {
        return principal.attributes
    }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>
    {
        return principal.authorities
    }

    override fun getName(): String
    {
        return principal.name
    }
}
