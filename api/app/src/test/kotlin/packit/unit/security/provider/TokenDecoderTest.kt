package packit.unit.security.provider

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import packit.AppConfig
import packit.exceptions.PackitException
import packit.security.profile.UserPrincipal
import packit.security.provider.TokenDecoder
import packit.security.provider.TokenProvider
import java.time.Duration
import java.time.temporal.ChronoUnit
import java.util.*
import kotlin.test.assertEquals

class TokenDecoderTest
{
    @Test
    fun `can decode JWT token`()
    {
        val name = "fakeName"
        val email = "test@email.com"

        val userPrincipal = UserPrincipal(
            email,
            "",
            mutableListOf(),
            name,
            mutableMapOf()
        )

        val mockAuthentication = mock<Authentication> {
            on { principal } doReturn userPrincipal
        }

        val provider = TokenProvider(AppConfig())

        val jwtToken = provider.issue(mockAuthentication)

        val result = TokenDecoder(AppConfig()).decode(jwtToken)

        val expectedDatetime = result.getClaim("datetime").asDate().toInstant()

        val expectedExpiresAt = Date.from(expectedDatetime.plus(Duration.of(1, ChronoUnit.DAYS)))

        assertEquals(listOf("packit"), result.audience)
        assertEquals("packit-api", result.issuer)
        assertEquals("test@email.com", result.getClaim("email").asString())
        assertEquals("fakeName", result.getClaim("name").asString())
        assertEquals(emptyList(), result.getClaim("au").asList(String::class.java))
        assertEquals(expectedExpiresAt, result.expiresAt)
    }

    @Test
    fun `can throw exception if jwt token is invalid format`()
    {
        val jwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQ4bOcs5YPybdtYZbp3Dijr6_EIMpQ0"

        val tokenDecoder = TokenDecoder(AppConfig())

        val errorThrown = assertThrows<PackitException> { tokenDecoder.decode(jwtToken) }

        assertEquals(
            "PackitException with key verification failed: " +
                    "The token was expected to have 3 parts, but got 2.",
            errorThrown.message
        )

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, errorThrown.httpStatus)
    }

    @Test
    fun `throws exception when using unknown jwt token provider`()
    {
        val jwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE" +
                    "2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

        val tokenDecoder = TokenDecoder(AppConfig())

        val errorThrown = assertThrows<PackitException> { tokenDecoder.decode(jwtToken) }

        assertEquals(
            "PackitException with key signature failed: The Token's Signature resulted " +
                    "invalid when verified using the Algorithm: HmacSHA256",
            errorThrown.message
        )

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, errorThrown.httpStatus)
    }

    @Test
    fun `throws exception when using expired jwt token`()
    {
        val jwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwiZW1haWwiO" +
                    "iJ0ZXN0QGVtYWlsLmNvbSIsIm5hbWUiOiJmYWtlTmFtZSIsImRhdGV0aW1lIjoxNjk1MzA0MzU4LCJhdSI6W10sImV" +
                    "4cCI6MTY5NTM5MDc1OH0.8MkhkfOZfeKPssUw2h65JkE-i9LgbjRFEqZJl9hcgKw"

        val tokenDecoder = TokenDecoder(AppConfig())

        val errorThrown = assertThrows<PackitException> { tokenDecoder.decode(jwtToken) }

        assertEquals(
            "PackitException with key expired token: The Token has expired on 2023-09-22T13:52:38Z.",
            errorThrown.message
        )

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, errorThrown.httpStatus)
    }
}