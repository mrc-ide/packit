package packit.security.profile

import com.auth0.jwt.interfaces.DecodedJWT
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component

interface TokenToPrincipal
{
    fun convert(jwt: DecodedJWT): UserPrincipal
    fun extractAuthorities(jwt: DecodedJWT): MutableCollection<out GrantedAuthority>
}

@Component
class TokenToPrincipalConverter : TokenToPrincipal
{
    override fun convert(jwt: DecodedJWT): UserPrincipal
    {
        return UserPrincipal(
            jwt.getClaim("email").toString(),
            "",
            extractAuthorities(jwt)
        )
    }

    override fun extractAuthorities(jwt: DecodedJWT): MutableCollection<out GrantedAuthority>
    {
        val claims = jwt.getClaim("a")

        if (claims.isNull || claims.isMissing)
        {
            return mutableListOf()
        }

        return claims.asList(SimpleGrantedAuthority::class.java)
    }
}
