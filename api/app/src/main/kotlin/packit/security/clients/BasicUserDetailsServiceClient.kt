package packit.security.clients

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.security.profile.UserPrincipal
import packit.service.UserService

@Component
class BasicUserDetailsServiceClient(val userService: UserService) : UserDetailsService
{
    override fun loadUserByUsername(username: String): UserDetails
    {
        val user = userService.findByEmail(username)
            .orElseThrow { PackitException("User $username does not exist") }

        return UserPrincipal(
            user.email,
            user.password,
            mutableListOf(SimpleGrantedAuthority(user.role.toString())),
            user.name,
            user.attributes
        )
    }
}
