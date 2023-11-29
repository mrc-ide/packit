package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.security.core.Authentication
import packit.security.oauth2.OAuth2SuccessHandler
import packit.security.provider.JwtIssuer

class OAuth2SuccessHandlerTest : OAuthHandlerTest()
{
    @Test
    fun `can redirect on authentication exception`()
    {
        val mockAuth = mock<Authentication>()
        val token = "fakeToken"

        val mockJwtIssuer = mock<JwtIssuer> {
            on { issue(mockAuth) } doReturn token
        }

        val sut = OAuth2SuccessHandler(mockRedirect, mockJwtIssuer)

        sut.onAuthenticationSuccess(mockRequest, mockResponse, mockAuth)
        verify(mockRedirect).redirectToBrowser(eq(mockRequest), eq(mockResponse), capture(qsCaptor))
        assert((qsCaptor.value["token"]?.get(0) ?: "") == token)
    }
}
