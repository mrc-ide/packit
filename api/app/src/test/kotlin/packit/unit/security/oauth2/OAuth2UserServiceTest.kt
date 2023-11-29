package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.OAuth2AccessToken
import org.springframework.security.oauth2.core.user.OAuth2User
import packit.clients.GithubUserClient
import packit.security.oauth2.OAuth2UserService
import packit.security.profile.UserPrincipal
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class OAuth2UserServiceTest
{
    private val mockGithubUserClient = mock<GithubUserClient>()
    @Test
    fun `can process oauth user attributes`()
    {
        val fakeEmail = "test@example.com"
        val fakeName = "Jammy"

        val mockOAuth2User = mock<OAuth2User> {
            on { attributes } doReturn mapOf("email" to fakeEmail, "name" to fakeName)
        }

        val sut = OAuth2UserService(mockGithubUserClient)

        val result = sut.processOAuth2User(mockOAuth2User)

        assertTrue(result is UserPrincipal)

        assertEquals(result.username, fakeEmail)

        assertEquals(result.name, fakeName)
    }

    @Test
    fun `can check user github membership`()
    {
        val mockAccessToken = mock<OAuth2AccessToken> {
            on { tokenValue } doReturn "fakeToken"
        }
        val mockRequest = mock<OAuth2UserRequest> {
            on { accessToken } doReturn mockAccessToken
        }

        val sut = OAuth2UserService(mockGithubUserClient)

        sut.checkGithubUserMembership(mockRequest)
        verify(mockGithubUserClient).authenticate("fakeToken")
        verify(mockGithubUserClient).checkGithubOrgMembership()
    }
}
