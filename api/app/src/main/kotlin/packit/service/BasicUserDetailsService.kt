package packit.service

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.model.BasicUser
import packit.security.Role
import packit.security.profile.BasicUserDetails
import packit.security.profile.UserPrincipal

@Component
class BasicUserDetailsService() : UserDetailsService
{
    // TODO: replace this with fetching real user details from a repo
    companion object
    {
        const val USERNAME = "test.user@example.com"
        const val PASSWORD = "\$2a\$10\$kU72ogo64j8omRjSAJQnPeEXIg2b/P6r7mVpi3g9rjzSBVcqOCaV2" // plain text: "password"
        const val DISPLAYNAME = "Test User"
    }

    override fun loadUserByUsername(username: String): UserDetails
    {
        val user = findByEmail(username)

        return BasicUserDetails(
            UserPrincipal(
                user.userName,
                user.displayName,
                mutableListOf(SimpleGrantedAuthority(user.role.toString())),
                user.attributes
            ),
            user.password
        )
    }

    private fun findByEmail(email: String): BasicUser
    {
        if (!USERNAME.equals(email, ignoreCase = true))
        {
            throw PackitException("User $email does not exist")
        }

        return BasicUser(
            USERNAME,
            PASSWORD,
            DISPLAYNAME,
            listOf(Role.USER),
            mutableMapOf()
        )
    }
}