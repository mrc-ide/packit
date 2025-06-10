package packit.unit.security.provider

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.User
import packit.security.provider.TokenDecoder
import packit.security.provider.TokenProvider
import java.time.Duration
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TokenDecoderTest {
    private val mockAppConfig = mock<AppConfig> {
        on { authJWTSecret } doReturn "changesecretkey"
        on { authExpiryDays } doReturn 1
    }

    @Test
    fun `can decode JWT token`() {
        val userName = "fakeName"
        val displayName = "Fake Name"

        val user = User(
            username = userName,
            displayName = displayName,
            disabled = false,
            userSource = "basic",
        )

        val provider = TokenProvider(mockAppConfig)

        val jwtToken = provider.issue(user)

        val result = TokenDecoder(mockAppConfig).decode(jwtToken)

        val expectedExpiresAt = result.issuedAtAsInstant.plus(Duration.ofDays(1))

        assertEquals(listOf("packit"), result.audience)
        assertEquals("packit-api", result.issuer)
        assertEquals("Fake Name", result.getClaim("displayName").asString())
        assertEquals("fakeName", result.getClaim("userName").asString())
        assertTrue(result.getClaim("au").isMissing)
        assertEquals(expectedExpiresAt, result.expiresAtAsInstant)
    }

    @Test
    fun `can throw exception if jwt token is invalid format`() {
        val jwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQ4bOcs5YPybdtYZbp3Dijr6_EIMpQ0"

        val tokenDecoder = TokenDecoder(mockAppConfig)

        val errorThrown = assertThrows<PackitException> { tokenDecoder.decode(jwtToken) }

        assertEquals("jwtVerificationFailed", errorThrown.key)

        assertEquals(HttpStatus.UNAUTHORIZED, errorThrown.httpStatus)
    }

    @Test
    fun `throws exception when using unknown jwt token provider`() {
        val jwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE" +
                "2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

        val tokenDecoder = TokenDecoder(mockAppConfig)

        val errorThrown = assertThrows<PackitException> { tokenDecoder.decode(jwtToken) }

        assertEquals("jwtSignatureVerificationFailed", errorThrown.key)

        assertEquals(HttpStatus.UNAUTHORIZED, errorThrown.httpStatus)
    }

    @Test
    fun `throws exception when using expired jwt token`() {
        val jwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwiZW1haWwiO" +
                "iJ0ZXN0QGVtYWlsLmNvbSIsIm5hbWUiOiJmYWtlTmFtZSIsImRhdGV0aW1lIjoxNjk1MzA0MzU4LCJhdSI6W10sImV" +
                "4cCI6MTY5NTM5MDc1OH0.8MkhkfOZfeKPssUw2h65JkE-i9LgbjRFEqZJl9hcgKw"

        val tokenDecoder = TokenDecoder(mockAppConfig)

        val errorThrown = assertThrows<PackitException> { tokenDecoder.decode(jwtToken) }

        assertEquals("jwtTokenExpired", errorThrown.key)

        assertEquals(HttpStatus.UNAUTHORIZED, errorThrown.httpStatus)
    }
}
