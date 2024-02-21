package packit.security.oauth2

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.security.profile.UserPrincipal
import packit.service.UserService

@Component
class BasicUserDetailsService() : UserDetailsService
{
    // TODO: replace this with fetching real user details from a repo
    companion object
    {
        const val USER = "test.user@example.com"
        const val PASSWORD = "$2a$12$676UJYz9Geh5Ki1jPMwMg.kI6HcYw94uWRs39mEWZbOP8KDx0gOHu"
    }

    override fun loadUserByUsername(username: String): UserDetails
    {
        val user = findByEmail(username)
            .orElseThrow { PackitException("User $username does not exist") }

        return UserPrincipal(
            user.email,
            user.password,
            mutableListOf(SimpleGrantedAuthority(user.role.toString())),
            user.name,
            user.attributes
        )
    }

    private fun findByEmail(username: string): User?
    {
        if (!USER.equals(email, ignoreCase = true))
        {
            return null
        }

        return  User(
                1L,
                USER,
                PASSWORD,
                Role.USER,
                "TEST_USER",
                mutableMapOf()
            )
    }
}