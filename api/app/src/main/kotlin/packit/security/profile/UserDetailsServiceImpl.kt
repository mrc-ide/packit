package packit.security.profile

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.service.UserService

@Component
class UserDetailsServiceImpl(val userService: UserService) : UserDetailsService
{
    override fun loadUserByUsername(username: String): UserDetails
    {
        val user = userService.findByEmail(username)
            .orElseThrow { PackitException("user does not exist") }

        return UserPrincipal(user.email, user.password, mutableListOf(SimpleGrantedAuthority(user.role.toString())))
    }
}
