package packit.security.profile

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import packit.model.User

class BasicUserDetails(
    val user: User
) : UserDetails {
    override fun getAuthorities(): Collection<GrantedAuthority> {
        return setOf()
    }

    override fun getPassword(): String {
        return user.password ?: throw IllegalStateException("Password is not set for user: ${user.username}")
    }

    override fun getUsername(): String {
        return user.username
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
