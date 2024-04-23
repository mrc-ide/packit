package packit.service

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import packit.security.profile.BasicUserDetails
import packit.security.profile.UserPrincipal

@Component
class BasicUserDetailsService(
    private val userService: UserService
) : UserDetailsService
{
    override fun loadUserByUsername(username: String): UserDetails
    {
        val user = userService.getUserForLogin(username)
        val grantedAuthorities =
            user.userGroups.map { it.role.toString() }.map { SimpleGrantedAuthority(it) }.toMutableList()
        return BasicUserDetails(
            UserPrincipal(
                user.username,
                user.displayName,
                grantedAuthorities,
                mutableMapOf()
            ),
            user.password!!
        )
    }
}
