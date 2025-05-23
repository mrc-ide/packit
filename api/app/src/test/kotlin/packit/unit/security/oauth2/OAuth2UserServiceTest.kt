package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.OAuth2AccessToken
import packit.clients.GithubUserClient
import packit.model.Role
import packit.model.User
import packit.security.oauth2.OAuth2UserService
import packit.service.UserService

class OAuth2UserServiceTest {
    private val mockGithubUserClient = mock<GithubUserClient>()
    private val fakeLogin = "jammy123"
    private val fakeName = "Jammy"
    private val fakeUser = User(
        username = fakeLogin, displayName = fakeName, disabled = false,
        userSource = "github", roles = mutableListOf(Role(name = "USER"))
    )
    private val mockUserService = mock<UserService> {
        on { saveUserFromGithub(fakeLogin, fakeName, null) } doReturn fakeUser
    }

    @Test
    fun `can check user github membership`() {
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
