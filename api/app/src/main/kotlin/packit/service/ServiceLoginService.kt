package packit.service

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtClaimValidator
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.security.oauth2.jwt.JwtIssuerValidator
import org.springframework.security.oauth2.jwt.JwtTimestampValidator
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.stereotype.Component
import org.springframework.web.client.RestOperations
import org.springframework.web.client.RestTemplate
import packit.config.ServiceLoginConfig
import packit.config.ServiceLoginPolicy
import packit.exceptions.PackitException
import packit.model.dto.LoginWithToken
import packit.security.provider.JwtIssuer
import java.util.function.Predicate

data class TokenPolicy(
  val decoder: NimbusJwtDecoder,
  val config: ServiceLoginPolicy,
)

@Component
class ServiceLoginService(
  val jwtIssuer: JwtIssuer,
  val userService: UserService,
  val serviceLoginConfig: ServiceLoginConfig,
  val restOperations: RestOperations = RestTemplate(),
) {
  val audience: String? = serviceLoginConfig.audience
  fun isEnabled(): Boolean = audience != null && !audience!!.isEmpty()

  private val policies: List<TokenPolicy>

  init {
    if (audience != null) {
      val audValidator = JwtClaimValidator<List<String>>(
        IdTokenClaimNames.AUD, { claimValue -> claimValue != null && claimValue.contains(audience) }
      )
      policies = serviceLoginConfig.policies.map { policy ->
        val validators = mutableListOf(
          JwtTimestampValidator(),
          JwtIssuerValidator(policy.issuer),
          audValidator,
        )

        policy.requiredClaims.mapTo(validators, { entry ->
          JwtClaimValidator<String>(entry.key, Predicate.isEqual(entry.value))
        })

        val decoder = NimbusJwtDecoder.withJwkSetUri(policy.jwkSetURI)
                                      .restOperations(restOperations)
                                      .build()

        decoder.setJwtValidator(DelegatingOAuth2TokenValidator(validators))
        TokenPolicy(decoder, policy)
      }
    } else {
      policies = listOf()
    }
  }

  private fun issueToken(verifiedToken: Jwt, policy: ServiceLoginPolicy): String {
      val user = userService.getServiceUser()
      val userPrincipal = userService.getUserPrincipal(user)
      val tokenBuilder = jwtIssuer.builder(userPrincipal)
      tokenBuilder.withPermissions(policy.grantedPermissions)

      val expiresAt = verifiedToken.expiresAt
      if (expiresAt != null) {
        tokenBuilder.withExpiresAt(expiresAt)
      }
      if (policy.tokenDuration != null) {
        tokenBuilder.withDuration(policy.tokenDuration)
      }
      return tokenBuilder.issue()
  }

  fun authenticateAndIssueToken(user: LoginWithToken): Map<String, String> {
    for (policy in policies) {
      val decodedToken = try {
        policy.decoder.decode(user.token)
      } catch (e: JwtException) {
        log.info("JWT policy rejected: {}", e.message)
        continue
      }
      val issuedToken = issueToken(decodedToken, policy.config)

      return mapOf("token" to issuedToken)
    }

    throw PackitException("externalJwtTokenInvalid", HttpStatus.UNAUTHORIZED)
  }

  companion object
  {
    private val log = LoggerFactory.getLogger(ServiceLoginService::class.java)
  }
}
