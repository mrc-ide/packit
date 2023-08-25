package packit.security.profile

import net.minidev.json.annotate.JsonIgnore
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class UserPrincipal(
    private val email: String,
    @JsonIgnore
    private val password: String,
    private val authorities: MutableCollection<out GrantedAuthority>): UserDetails
{
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
