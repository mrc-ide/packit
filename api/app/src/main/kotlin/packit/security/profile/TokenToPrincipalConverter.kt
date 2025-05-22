package packit.security.profile

import com.auth0.jwt.interfaces.DecodedJWT
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component

interface TokenToPrincipal {
    fun convert(jwt: DecodedJWT): UserPrincipal
    fun extractAuthorities(jwt: DecodedJWT): MutableCollection<out GrantedAuthority>
}

@Component
class TokenToPrincipalConverter : TokenToPrincipal {
    override fun convert(jwt: DecodedJWT): UserPrincipal {
        return UserPrincipal(
            jwt.getClaim("userName").asString(),
            jwt.getClaim("displayName").let { if (it.isNull) null else it.asString() },
            extractAuthorities(jwt),
            mutableMapOf()
        )
    }

    override fun extractAuthorities(jwt: DecodedJWT): MutableCollection<out GrantedAuthority> {
        val claims = jwt.getClaim("au")

        if (claims.isNull || claims.isMissing) {
            return mutableListOf()
        }

        return claims.asList(SimpleGrantedAuthority::class.java)
    }
}
