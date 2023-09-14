package packit.security.issuer

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.security.profile.UserPrincipal
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

interface JwtIssuer
{
    fun issue(authentication: Authentication): String
}

@Component
class TokenProvider(val config: AppConfig) : JwtIssuer
{
    companion object
    {
        const val TOKEN_ISSUER = "packit-api"
        const val TOKEN_AUDIENCE = "packit"
    }

    override fun issue(authentication: Authentication): String
    {
        val user = authentication.principal as UserPrincipal

        val roles = user.authorities.map { it.authority }

        return JWT.create()
            .withAudience(TOKEN_AUDIENCE)
            .withIssuer(TOKEN_ISSUER)
            .withClaim("email", "user.username")
            .withClaim("datetime", Instant.now())
            .withClaim("role", roles)
            .withExpiresAt(Instant.now().plus(Duration.of(1, ChronoUnit.DAYS)))
            .sign(Algorithm.HMAC256(config.authBasicSecret))
    }
}
