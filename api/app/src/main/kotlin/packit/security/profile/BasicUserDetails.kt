package packit.security.profile

import net.minidev.json.annotate.JsonIgnore
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.authority.AuthorityUtils

class BasicUserDetails(
    private val principal: UserPrincipal,
    @JsonIgnore
    private val password: String
) : UserDetails
{
    /*companion object
    {
        fun create(user: User, attributes: MutableMap<String, Any>): BasicUserDetails
        {
            val authorities = AuthorityUtils.createAuthorityList(user.role.toString())
            return BasicUserDetails(
                UserPrincipal(user.userName, user.displayName, authorities, attributes),
                user.password
            )
        }
    }*/

    /*override fun getName(): String
    {
        return principal.displayName
    }*/

    /*override fun getAttributes(): MutableMap<String, Any>
    {
        return principal.attributes
    }*/

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>
    {
        return principal.authorities
    }

    override fun getPassword(): String
    {
        return password
    }

    override fun getUsername(): String
    {
        return principal.name
    }

    override fun isAccountNonExpired(): Boolean
    {
        return true
    }

    override fun isAccountNonLocked(): Boolean
    {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean
    {
        return true
    }

    override fun isEnabled(): Boolean
    {
        return true
    }
}
