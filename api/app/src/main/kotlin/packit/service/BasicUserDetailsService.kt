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
        return BasicUserDetails(
            UserPrincipal(
                user.username,
                user.displayName,
                mutableListOf(SimpleGrantedAuthority(user.userGroups.map { it.role }.toString())),
                mutableMapOf()
            ),
            user.password!!
        )
    }
}
