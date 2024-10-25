package packit.unit.security

import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.exceptions.PackitException
import packit.security.TokenAuthenticationFilter
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class TokenAuthenticationFilterTest
{
    @Test
    fun `can extract token from jwt`()
    {
        val mockHttpRequest = mock<HttpServletRequest> {
            on { getHeader("Authorization") } doReturn "Bearer faketoken"
        }

        val sut = TokenAuthenticationFilter(mock(), mock())

        val result = sut.extractToken(mockHttpRequest)

        assertEquals(result, Optional.of("faketoken"))
    }

    @Test
    fun `can throw PackitException when token type is invalid`()
    {
        val mockHttpRequest = mock<HttpServletRequest> {
            on { getHeader("Authorization") } doReturn "faketoken"
        }

        val sut = TokenAuthenticationFilter(mock(), mock())

        val thrownError = assertThrows<PackitException> { sut.extractToken(mockHttpRequest) }

        assertEquals(
            "invalidAuthType",
            thrownError.key
        )
    }

    @Test
    fun `returns empty optional if token is empty`()
    {
        val mockHttpRequest = mock<HttpServletRequest>()

        val sut = TokenAuthenticationFilter(mock(), mock())

        val result = sut.extractToken(mockHttpRequest)

        assertEquals(result, Optional.empty())
    }
}
