package packit.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.convert.DurationUnit
import java.time.Duration
import java.time.temporal.ChronoUnit

data class JwtPolicy(
  val jwkSetURI: String,
  val issuer: String,
  val requiredClaims: Map<String, String> = mapOf(),
  val grantedPermissions: List<String> = listOf(),

  @DurationUnit(ChronoUnit.SECONDS)
  val tokenDuration: Duration? = null,
)

@ConfigurationProperties(prefix = "auth.external-jwt")
data class JwtLoginConfig(
  val audience: String?,
  val policy: List<JwtPolicy> = listOf()
)
