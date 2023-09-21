package packit.unit.security.provider

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.exceptions.PackitException
import packit.security.provider.TokenDecoder
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals

class TokenDecoderTest
{
    @Test
    fun `can decode JWT token`()
    {
        val jwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwiZW1haWwiO" +
                    "iJ0ZXN0QGVtYWlsLmNvbSIsIm5hbWUiOiJmYWtlTmFtZSIsImRhdGV0aW1lIjoxNjk1MzA0MzU4LCJhdSI6W10sImV" +
                    "4cCI6MTY5NTM5MDc1OH0.8MkhkfOZfeKPssUw2h65JkE-i9LgbjRFEqZJl9hcgKw"

        val tokenDecoder = TokenDecoder(AppConfig())

        val result = tokenDecoder.decode(jwtToken)

        val expectedDatetime = Date.from(Instant.parse("2023-09-21T12:56:11Z"))

        val expectedExpiresAt = Date.from(Instant.parse("2023-09-22T12:56:11Z"))

        assertEquals(listOf("packit"), result.audience)
        assertEquals("packit-api", result.issuer)
        assertEquals("test@email.com", result.getClaim("email").asString())
        assertEquals("fakeName", result.getClaim("name").asString())
        assertEquals(result.getClaim("datetime").asDate(), expectedDatetime)
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
            "PackitException with key Verification failed: " +
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
            "PackitException with key Signature failed: The Token's Signature resulted " +
                    "invalid when verified using the Algorithm: HmacSHA256",
            errorThrown.message
        )

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, errorThrown.httpStatus)
    }
}
