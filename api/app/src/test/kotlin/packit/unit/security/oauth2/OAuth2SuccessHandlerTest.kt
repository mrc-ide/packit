package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.security.core.Authentication
import packit.model.User
import packit.security.oauth2.OAuth2SuccessHandler
import packit.security.profile.PackitOAuth2User
import packit.security.provider.JwtIssuer

class OAuth2SuccessHandlerTest : OAuthHandlerTest() {
    @Test
    fun `can redirect on authentication exception`() {
        val user = User(
            username = "name",
            displayName = "displayName",
            disabled = false,
            userSource = "basic",
        )
        val mockAuth = mock<Authentication> {
            on { principal } doReturn PackitOAuth2User(
                user
            )
        }
        val token = "fakeToken"

        val mockJwtIssuer = mock<JwtIssuer> {
            on { issue(user) } doReturn token
        }

        val sut = OAuth2SuccessHandler(mockRedirect, mockJwtIssuer)

        sut.onAuthenticationSuccess(mockRequest, mockResponse, mockAuth)
        verify(mockRedirect).redirectToBrowser(eq(mockRequest), eq(mockResponse), capture(qsCaptor))
        assert((qsCaptor.value["token"]?.get(0) ?: "") == token)
    }
}
