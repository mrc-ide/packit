package packit.security.profile

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.oauth2.core.user.OAuth2User

class PackitOAuth2User(
    val principal: UserPrincipal
) : OAuth2User
{
    /*companion object
    {
        fun create(user: User, attributes: MutableMap<String, Any>): PackitOAuth2User
        {
            val authorities = AuthorityUtils.createAuthorityList(user.role.toString())
            return PackitOAuth2User(
                UserPrincipal(user.userName, user.displayName, authorities, attributes)
            )
        }
    }*/

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
