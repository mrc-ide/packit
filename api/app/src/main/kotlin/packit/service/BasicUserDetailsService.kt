package packit.service

import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import packit.security.profile.BasicUserDetails

@Component
class BasicUserDetailsService(
    private val userService: UserService
) : UserDetailsService {
    override fun loadUserByUsername(username: String): UserDetails {
        val user = userService.getUserForBasicLogin(username)
        return BasicUserDetails(
            userService.getUserPrincipal(user),
            user.password!!
        )
    }
}
