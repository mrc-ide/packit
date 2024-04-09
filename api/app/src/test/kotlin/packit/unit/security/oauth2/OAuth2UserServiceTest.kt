package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.OAuth2AccessToken
import org.springframework.security.oauth2.core.user.OAuth2User
import packit.clients.GithubUserClient
import packit.model.User
import packit.model.UserGroup
import packit.security.Role
import packit.security.oauth2.OAuth2UserService
import packit.service.UserService
import kotlin.test.assertEquals

class OAuth2UserServiceTest
{
    private val mockGithubUserClient = mock<GithubUserClient>()
    private val fakeLogin = "jammy123"
    private val fakeName = "Jammy"
    private val fakeUser = User(
        username = fakeLogin, displayName = fakeName, disabled = false,
        userSource = "github", userGroups = mutableListOf(UserGroup(role = Role.USER))
    )
    private val mockUserService = mock<UserService> {
        on { saveUserFromGithub(fakeLogin, fakeName, null) } doReturn fakeUser
    }

    @Test
    fun `can process oauth user attributes`()
    {
        val mockOAuth2User = mock<OAuth2User> {
            on { attributes } doReturn mapOf("login" to fakeLogin, "name" to fakeName)
        }

        val sut = OAuth2UserService(mockGithubUserClient, mockUserService)

        val result = sut.processOAuth2User(mockOAuth2User)

        assertEquals(result.name, fakeLogin)
        assertEquals(result.getAttribute("login"), fakeLogin)
        assertEquals(result.getAttribute("name"), fakeName)
        verify(mockUserService).saveUserFromGithub(fakeLogin, fakeName, null)
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

        val sut = OAuth2UserService(mockGithubUserClient, mockUserService)

        sut.checkGithubUserMembership(mockRequest)
        verify(mockGithubUserClient).authenticate("fakeToken")
        verify(mockGithubUserClient).checkGithubMembership()
    }
}
