package packit.security.provider

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.security.profile.UserPrincipal
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

interface JwtBuilder {
    fun withExpiresAt(expiry: Instant): JwtBuilder
    fun withDuration(duration: Duration): JwtBuilder
    fun withPermissions(permissions: Collection<String>): JwtBuilder
    fun issue(): String
}

interface JwtIssuer {
    fun issue(userPrincipal: UserPrincipal): String {
        return builder(userPrincipal).issue()
    }

    fun builder(userPrincipal: UserPrincipal): JwtBuilder
}

class TokenProviderBuilder(val config: AppConfig, val userPrincipal: UserPrincipal) : JwtBuilder {
    companion object {
        const val TOKEN_ISSUER = "packit-api"
        const val TOKEN_AUDIENCE = "packit"
    }

    private var duration: Duration = Duration.of(config.authExpiryDays, ChronoUnit.DAYS)
    private var expiry: Instant? = null
    private var permissions: MutableSet<String>? = null

    override fun withExpiresAt(expiry: Instant): JwtBuilder {
        if (this.expiry == null || expiry > this.expiry) {
            this.expiry = expiry
        }
        return this
    }

    override fun withDuration(duration: Duration): JwtBuilder {
        if (duration < this.duration) {
            this.duration = duration
        }
        return this
    }

    override fun withPermissions(permissions: Collection<String>): JwtBuilder {
        if (this.permissions == null) {
            this.permissions = permissions.toMutableSet()
        } else {
            this.permissions!!.retainAll(permissions.toSet())
        }
        return this
    }

    override fun issue(): String {
        val issuedAt = Instant.now()
        var expiresAt = issuedAt.plus(duration)
        if (expiry != null && expiry!! < expiresAt) {
            expiresAt = expiry
        }

        return JWT.create()
            .withAudience(TOKEN_AUDIENCE)
            .withIssuer(TOKEN_ISSUER)
            .withClaim("userName", userPrincipal.name)
            .withClaim("displayName", userPrincipal.displayName)
            .apply {
                if (permissions != null) {
                    this.withClaim("au", permissions!!.toList())
                }
            }
            .withIssuedAt(issuedAt)
            .withExpiresAt(expiresAt)
            .sign(Algorithm.HMAC256(config.authJWTSecret))
    }
}

@Component
class TokenProvider(val config: AppConfig) : JwtIssuer {
    override fun builder(userPrincipal: UserPrincipal): JwtBuilder {
        return TokenProviderBuilder(config, userPrincipal)
    }
}
