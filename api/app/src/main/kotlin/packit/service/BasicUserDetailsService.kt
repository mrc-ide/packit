package packit.service

import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import packit.security.profile.BasicUserDetails
import packit.security.profile.UserPrincipal

@Component
class BasicUserDetailsService(
    private val userService: UserService,
    private val roleService: RoleService
) : UserDetailsService
{
    override fun loadUserByUsername(username: String): UserDetails
    {
        val user = userService.getUserForBasicLogin(username)
        return BasicUserDetails(
            UserPrincipal(
                user.username,
                user.displayName,
                roleService.getGrantedAuthorities(user.roles),
                mutableMapOf()
            ),
            user.password!!
        )
    }
}
