package packit.testing

import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator
import com.nimbusds.jose.jwk.source.ImmutableJWKSet
import org.mockito.kotlin.*
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder
import org.springframework.test.web.client.match.MockRestRequestMatchers.*
import org.springframework.test.web.client.response.DefaultResponseCreator.*
import org.springframework.test.web.client.response.MockRestResponseCreators.*

class TestJwtIssuer {
    val jwkSet = JWKSet(RSAKeyGenerator(2048).keyIDFromThumbprint(true).generate())
    private val encoder = NimbusJwtEncoder(ImmutableJWKSet(jwkSet))

    fun issue(f: (JwtClaimsSet.Builder) -> Unit): String {
        val builder = JwtClaimsSet.builder()
        f(builder)
        val claims = builder.build()
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue()
    }
}
