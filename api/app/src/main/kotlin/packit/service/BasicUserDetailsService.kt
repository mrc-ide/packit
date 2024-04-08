package packit.service

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import packit.exceptions.PackitException
import packit.repository.UserRepository
import packit.security.profile.BasicUserDetails
import packit.security.profile.UserPrincipal

@Component
class BasicUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService
{
    @Transactional
    override fun loadUserByUsername(username: String): UserDetails
    {
        val user = userRepository.findByUsername(username) ?: throw PackitException("User $username does not exist");
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
