package packit.security.provider

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
    fun issue(user: UserPrincipal): String
}

@Component
class TokenProvider(val config: AppConfig) : JwtIssuer
{
    companion object
    {
        const val TOKEN_ISSUER = "packit-api"
        const val TOKEN_AUDIENCE = "packit"
    }

    override fun issue(user: UserPrincipal): String
    {
        val roles = user.authorities.map { it.authority }

        val createdDate = Instant.now()

        val expiredDate = createdDate.plus(Duration.of(config.authExpiryDays, ChronoUnit.DAYS))

        return JWT.create()
            .withAudience(TOKEN_AUDIENCE)
            .withIssuer(TOKEN_ISSUER)
            .withClaim("userName", user.name)
            .withClaim("displayName", user.displayName)
            .withClaim("datetime", createdDate)
            .withClaim("au", roles)
            .withExpiresAt(expiredDate)
            .sign(Algorithm.HMAC256(config.authJWTSecret))
    }
}
