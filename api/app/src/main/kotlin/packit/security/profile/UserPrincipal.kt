package packit.security.profile

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.oauth2.core.user.OAuth2User
import packit.model.User

open class UserPrincipal(
    private val name: String,
    val displayName: String?,
    private val authorities: MutableCollection<out GrantedAuthority>,
    private val attributes: MutableMap<String, Any>,
) : OAuth2User
{
    companion object
    {
        fun create(user: User, attributes: MutableMap<String, Any>): UserPrincipal
        {
            val authorities = AuthorityUtils.createAuthorityList(user.role.toString())
            return UserPrincipal(
                user.userName,
                user.displayName,
                authorities,
                attributes
            )
        }
    }

    override fun getAttributes(): MutableMap<String, Any>
    {
        return attributes
    }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>
    {
        return authorities
    }

    override fun getName(): String
    {
        return name
    }
}
