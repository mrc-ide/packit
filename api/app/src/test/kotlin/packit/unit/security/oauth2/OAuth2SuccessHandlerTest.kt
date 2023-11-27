package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.security.core.Authentication
import packit.AppConfig
import packit.security.oauth2.OAuth2SuccessHandler
import packit.security.provider.JwtIssuer
import kotlin.test.assertEquals

class OAuth2SuccessHandlerTest
{
    @Test
    fun `can build uri component`()
    {
        val mockAuth = mock<Authentication>()

        val formedUri = "http://frontend/redirect/?token=fakeToken"

        val token = "fakeToken"

        val mockAppConfig = mock<AppConfig> {
            on { authRedirectUri } doReturn "http://frontend/redirect/"
        }

        val mockJwtIssuer = mock<JwtIssuer> {
            on { issue(mockAuth) } doReturn token
        }

       /* val sut = OAuth2SuccessHandler(mockAppConfig, mockJwtIssuer)

        val result = sut.buildUri(token)

        assertEquals(result, formedUri)*/
    }
}
