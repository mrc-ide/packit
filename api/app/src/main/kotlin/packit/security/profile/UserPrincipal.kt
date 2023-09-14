package packit.security.profile

import net.minidev.json.annotate.JsonIgnore
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.core.user.OAuth2User
import packit.model.User

class UserPrincipal(
    private val email: String,
    @JsonIgnore
    private val password: String,
    private val authorities: MutableCollection<out GrantedAuthority>,
    private val name: String,
    private val attributes: MutableMap<String, Any>,
) : UserDetails, OAuth2User
{
    companion object
    {
        fun create(user: User, attributes: MutableMap<String, Any>): UserPrincipal
        {
            val authorities = AuthorityUtils.createAuthorityList(user.role.toString())
            return UserPrincipal(
                user.email,
                user.password,
                authorities,
                user.name,
                attributes
            )
        }
    }

    override fun getName(): String
    {
        return name
    }

    override fun getAttributes(): MutableMap<String, Any>
    {
        return attributes
    }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>
    {
        return authorities
    }

    override fun getPassword(): String
    {
        return password
    }

    override fun getUsername(): String
    {
        return email
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
