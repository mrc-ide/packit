package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.kohsuke.github.GHMyself
import org.mockito.kotlin.argThat
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.Role
import packit.model.User
import packit.model.dto.LoginWithToken
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.GithubAPILoginService
import packit.service.RoleService
import packit.service.UserService
import kotlin.test.assertEquals

class GithubAPILoginServiceTest
{
    private val mockConfig = mock<AppConfig>()
    private val username = "username"
    private val displayName = "displayName"
    private val fakeGHMyself = mock<GHMyself> {
        on { login } doReturn username
        on { name } doReturn displayName
    }
    private val fakeUser = User(
        username = username, displayName = displayName, disabled = false,
        userSource = "github", roles = mutableListOf(Role(name = "USER"))
    )
    private val mockUserService = mock<UserService> {
        on { saveUserFromGithub(username, displayName, null) } doReturn fakeUser
    }
    private val userPrincipal = UserPrincipal(
        username,
        displayName,
        mutableListOf(SimpleGrantedAuthority("USER")),
        mutableMapOf()
    )
    private val mockIssuer = mock<JwtIssuer> {
        on { issue(argThat { this == userPrincipal }) } doReturn "fake jwt"
    }
    private val mockGithubUserClient = mock<GithubUserClient> {
        on { getGithubUser() } doReturn fakeGHMyself
    }
    private val mockRoleService = mock<RoleService> {
        on { getGrantedAuthorities(fakeUser.roles) } doReturn mutableListOf(SimpleGrantedAuthority("USER"))
    }

    @Test
    fun `can authenticate and issue token`()
    {
        val sut = GithubAPILoginService(mockConfig, mockIssuer, mockGithubUserClient, mockUserService, mockRoleService)

        val token = sut.authenticateAndIssueToken(LoginWithToken("fake token"))

        assertEquals(mapOf("token" to "fake jwt"), token)
        verify(mockGithubUserClient).authenticate("fake token")
        verify(mockGithubUserClient).checkGithubMembership()
        verify(mockUserService).saveUserFromGithub(username, displayName, null)
    }

    @Test
    fun `throws exception if token is empty`()
    {
        val sut = GithubAPILoginService(mockConfig, mockIssuer, mockGithubUserClient, mockUserService, mockRoleService)
        val ex = assertThrows<PackitException> { sut.authenticateAndIssueToken(LoginWithToken("")) }
        assertEquals("emptyGitToken", ex.key)
        assertEquals(HttpStatus.BAD_REQUEST, ex.httpStatus)
    }
}
