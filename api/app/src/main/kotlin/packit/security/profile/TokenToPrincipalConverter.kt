package packit.security.profile

import com.auth0.jwt.interfaces.Claim
import com.auth0.jwt.interfaces.DecodedJWT
import org.springframework.http.HttpStatus
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.service.RoleService
import packit.service.UserService

interface TokenToPrincipal {
    fun convert(jwt: DecodedJWT): UserPrincipal
}

@Component
class TokenToPrincipalConverter(
    private val userService: UserService,
    private val roleService: RoleService,
) : TokenToPrincipal {
    override fun convert(jwt: DecodedJWT): UserPrincipal {
        val username = jwt.getClaim("userName").asString()
            ?: throw PackitException("userNameClaimNotInJwt", HttpStatus.UNAUTHORIZED)

        return UserPrincipal(
            username,
            jwt.getClaim("displayName").let { if (it.isNull) null else it.asString() },
            getAuthorities(jwt.getClaim("au"), username),
        )
    }

    /**
     * Get the authorities from the JWT or from the database if not present in the JWT.
     */
    internal fun getAuthorities(jwtAuthorities: Claim, username: String): MutableCollection<out GrantedAuthority> {
        if (!jwtAuthorities.isMissing) {
            return extractAuthorities(jwtAuthorities)
        }
        val user = userService.getByUsername(username) ?: throw PackitException(
            "userNotFound",
            HttpStatus.UNAUTHORIZED
        )
        return roleService.getGrantedAuthorities(user.roles)
    }

    internal fun extractAuthorities(jwtAuthorities: Claim): MutableCollection<out GrantedAuthority> {
        return if (jwtAuthorities.isNull) mutableListOf() else jwtAuthorities.asList(SimpleGrantedAuthority::class.java)
    }
}
