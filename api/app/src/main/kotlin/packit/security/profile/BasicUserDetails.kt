package packit.security.profile

import net.minidev.json.annotate.JsonIgnore
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class BasicUserDetails(
    val principal: UserPrincipal,
    @JsonIgnore
    private val password: String
) : UserDetails {
    override fun getAuthorities(): Collection<GrantedAuthority> {
        return principal.authorities
    }

    override fun getPassword(): String {
        return password
    }

    override fun getUsername(): String {
        return principal.name
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isEnabled(): Boolean {
        return true
    }
}
