package packit.unit.security.profile

import com.auth0.jwt.interfaces.Claim
import com.auth0.jwt.interfaces.DecodedJWT
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.AppConfig
import packit.security.profile.TokenToPrincipalConverter
import packit.security.profile.UserPrincipal
import packit.security.provider.TokenDecoder
import packit.security.provider.TokenProvider
import packit.unit.helpers.JSON
import kotlin.test.assertEquals

class TokenToPrincipalConverterTest
{
    @Test
    fun `can extract authorities`()
    {
        val mockClaim = mock<Claim>()

        val mockDecodedJWT = mock<DecodedJWT> {
            on { getClaim("au") } doReturn mockClaim
        }

        val sut = TokenToPrincipalConverter()

        val result = sut.extractAuthorities(mockDecodedJWT)

        assertEquals(result, mockClaim.asList(SimpleGrantedAuthority::class.java))
    }

    @Test
    fun `converts jwt to user principal`()
    {
        val userName = "fakeName"
        val displayName = "Fake Name"
        val mockAppConfig = mock<AppConfig> {
            on { authJWTSecret } doReturn "changesecretkey"
            on { authExpiryDays } doReturn 1
        }

        val userPrincipal = UserPrincipal(
            userName,
            displayName,
            mutableListOf(),
            mutableMapOf()
        )

        val mockAuthentication = mock<Authentication> {
            on { principal } doReturn userPrincipal
        }

        val provider = TokenProvider(mockAppConfig)

        val jwtToken = provider.issue(mockAuthentication.principal as UserPrincipal)

        val tokenDecoder = TokenDecoder(mockAppConfig)

        val decodedJwt = tokenDecoder.decode(jwtToken)

        val sut = TokenToPrincipalConverter()

        val result = sut.convert(decodedJwt)

        assertEquals(JSON.stringify(userPrincipal), JSON.stringify(result))
    }
}
