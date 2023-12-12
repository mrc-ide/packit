package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.LoginWithGithubToken
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.GithubAPILoginService
import kotlin.test.assertEquals

class GithubAPILoginServiceTest {
    private val mockConfig = mock<AppConfig>()
    private val mockUserPrincipal = mock<UserPrincipal>()
    private val mockIssuer = mock<JwtIssuer> {
        on { issue(argThat{ this.principal == mockUserPrincipal }) } doReturn "fake jwt"
    }
    private val mockGithubUserClient = mock<GithubUserClient> {
        on { getUser() } doReturn mockUserPrincipal
    }

    @Test
    fun `can authenticate and issue token`()
    {
        val sut = GithubAPILoginService(mockConfig, mockIssuer, mockGithubUserClient)
        val token = sut.authenticateAndIssueToken(LoginWithGithubToken("fake token"))
        assertEquals(mapOf("token" to "fake jwt"), token)
        verify(mockGithubUserClient).authenticate("fake token")
        verify(mockGithubUserClient).checkGithubMembership()
    }

    @Test
    fun `throws exception if token is empty`()
    {
        val sut = GithubAPILoginService(mockConfig, mockIssuer, mockGithubUserClient)
        val ex = assertThrows<PackitException>{ sut.authenticateAndIssueToken(LoginWithGithubToken("")) }
        assertEquals("emptyGitToken", ex.key)
        assertEquals(HttpStatus.BAD_REQUEST, ex.httpStatus)
    }
}
