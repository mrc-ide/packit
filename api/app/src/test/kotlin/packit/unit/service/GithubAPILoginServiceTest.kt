package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.argThat
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.model.LoginWithToken
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.GithubAPILoginService
import kotlin.test.assertEquals

class GithubAPILoginServiceTest
{
    private val mockConfig = mock<AppConfig>()
    private val userPrincipal = UserPrincipal(
        "userName",
        "displayName",
        mutableListOf(),
        mutableMapOf()
    )
    private val mockIssuer = mock<JwtIssuer> {
        on { issue(argThat { this == userPrincipal }) } doReturn "fake jwt"
    }
    private val mockGithubUserClient = mock<GithubUserClient> {
        on { getUserPrincipal() } doReturn userPrincipal
    }

    @Test
    fun `can authenticate and issue token`()
    {
        val sut = GithubAPILoginService(mockConfig, mockIssuer, mockGithubUserClient)
        val token = sut.authenticateAndIssueToken(LoginWithToken("fake token"))
        assertEquals(mapOf("token" to "fake jwt"), token)
        verify(mockGithubUserClient).authenticate("fake token")
        verify(mockGithubUserClient).checkGithubMembership()
    }

    @Test
    fun `throws exception if token is empty`()
    {
        val sut = GithubAPILoginService(mockConfig, mockIssuer, mockGithubUserClient)
        val ex = assertThrows<PackitException> { sut.authenticateAndIssueToken(LoginWithToken("")) }
        assertEquals("emptyGitToken", ex.key)
        assertEquals(HttpStatus.BAD_REQUEST, ex.httpStatus)
    }
}
