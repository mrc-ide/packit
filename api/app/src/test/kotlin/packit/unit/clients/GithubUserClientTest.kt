package packit.unit.clients

import org.assertj.core.api.Assertions.assertThatThrownBy
import org.kohsuke.github.*
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.doThrow
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.clients.GithubUserClient
import packit.exceptions.PackitAuthenticationException
import kotlin.test.Test
import kotlin.test.assertEquals

class GithubUserClientTest {
    private val mockConfig = mock<AppConfig> {
        on { authGithubAPIOrg } doReturn "mrc-ide"
        on { authGithubAPITeam } doReturn "packit"
    }

    private val mockTeam = mock<GHTeam>()
    private val anotherMockTeam = mock<GHTeam>()

    private val mockOrg = mock<GHOrganization> {
        on { login } doReturn "mrc-ide"
        on { teams } doReturn mapOf("packit" to mockTeam, "another-team" to anotherMockTeam)
    }
    private val mockOrgs = mock<GHPersonSet<GHOrganization>> {
        on { iterator() } doReturn mutableListOf(mockOrg).listIterator()
    }

    private val mockMyself = mock<GHMyself> {
        on { login } doReturn "test username"
        on { name } doReturn "test name"
        on { email } doReturn "test@login.com"
        on { allOrganizations } doReturn mockOrgs
        on { isMemberOf(mockTeam) } doReturn true
        on { isMemberOf(anotherMockTeam) } doReturn false
    }

    private val mockGitHub = mock<GitHub> {
        on { myself } doReturn mockMyself
    }

    private val mockGithubBuilder = mock<GitHubBuilder> { thisMock ->
        on { withOAuthToken(anyString()) } doReturn thisMock
        on { build() } doReturn mockGitHub
    }
    private val sut = GithubUserClient(mockConfig, mockGithubBuilder)

    private val token = "12345"

    @Test
    fun `can authenticate`() {
        sut.authenticate(token)
        verify(mockGithubBuilder).withOAuthToken(token)
        verify(mockGithubBuilder).build()
    }

    @Test
    fun `can getUser`() {
        sut.authenticate(token)

        val githubUser = sut.getGithubUser()

        assertEquals(githubUser.login, "test username")
        assertEquals(githubUser.email, "test@login.com")
        assertEquals(githubUser.name, "test name")
    }

    @Test
    fun `can check github org membership`() {
        sut.authenticate(token)
        sut.checkGithubMembership()
    }

    @Test
    fun `authenticates successfully when no team configured and user is in allowed org`() {
        val mockNoTeamConfig = mock<AppConfig> {
            on { authGithubAPIOrg } doReturn "mrc-ide"
            on { authGithubAPITeam } doReturn ""
        }
        val noTeamSut = GithubUserClient(mockNoTeamConfig, mockGithubBuilder)
        noTeamSut.authenticate(token)
        noTeamSut.checkGithubMembership()
    }

    @Test
    fun `throws expected exception when user is not in allowed org`() {
        val mockErrorConfig = mock<AppConfig> {
            on { authGithubAPIOrg } doReturn "mrc-idex"
        }
        val errorSut = GithubUserClient(mockErrorConfig, mockGithubBuilder)
        assertSutThrowsPackitAuthenticationException(errorSut, "githubUserRestrictedAccess", HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `throw expected exception when reading orgs is forbidden`() {
        whenever(mockMyself.allOrganizations).thenThrow(HttpException("test error", 403, "", ""))
        assertSutThrowsPackitAuthenticationException(sut, "githubTokenInsufficientPermissions", HttpStatus.FORBIDDEN)
    }

    @Test
    fun `throws expected exception when user is not in allowed team`() {
        val mockErrorConfig = mock<AppConfig> {
            on { authGithubAPIOrg } doReturn "mrc-ide"
            on { authGithubAPITeam } doReturn "another-team"
        }
        val errorSut = GithubUserClient(mockErrorConfig, mockGithubBuilder)
        assertSutThrowsPackitAuthenticationException(errorSut, "githubUserRestrictedAccess", HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `throws expected exception when allowed team is not in allowed org`() {
        val mockErrorConfig = mock<AppConfig> {
            on { authGithubAPIOrg } doReturn "mrc-ide"
            on { authGithubAPITeam } doReturn "team-not-in-org"
        }
        val errorSut = GithubUserClient(mockErrorConfig, mockGithubBuilder)
        assertSutThrowsPackitAuthenticationException(errorSut, "githubConfigTeamNotInOrg", HttpStatus.UNAUTHORIZED)
    }

    private fun assertSutThrowsPackitAuthenticationException(
        sut: GithubUserClient,
        key: String,
        httpStatus: HttpStatus
    ) {
        sut.authenticate(token)
        assertThatThrownBy { sut.checkGithubMembership() }
            .isInstanceOf(PackitAuthenticationException::class.java)
            .matches { (it as PackitAuthenticationException).key === key }
            .matches { (it as PackitAuthenticationException).httpStatus === httpStatus }
    }

    private fun assertHandlesHttpExceptionOnAuthenticate(
        exceptionStatusCode: Int,
        expectedPackitExceptionKey: String,
        expectedPackitExceptionStatus: HttpStatus
    ) {
        val mockErroringGithub = mock<GitHub> {
            on { myself } doThrow HttpException("test error", exceptionStatusCode, "", "")
        }
        val mockErroringGhBuilder = mock<GitHubBuilder> { thisMock ->
            on { withOAuthToken(anyString()) } doReturn thisMock
            on { build() } doReturn mockErroringGithub
        }

        val errorSut = GithubUserClient(mockConfig, mockErroringGhBuilder)
        assertThatThrownBy { errorSut.authenticate("token") }
            .isInstanceOf(PackitAuthenticationException::class.java)
            .matches { (it as PackitAuthenticationException).key === expectedPackitExceptionKey }
            .matches { (it as PackitAuthenticationException).httpStatus === expectedPackitExceptionStatus }
    }

    @Test
    fun `handles unauthorized error on authenticate`() {
        assertHandlesHttpExceptionOnAuthenticate(401, "githubTokenInvalid", HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `handles other Http exceptions on authenticate`() {
        assertHandlesHttpExceptionOnAuthenticate(400, "githubTokenUnexpectedError", HttpStatus.BAD_REQUEST)
    }

    private fun assertThrowsUserNotAutheticated(call: () -> Any) {
        assertThatThrownBy { call() }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessage("User has not been authenticated")
    }

    @Test
    fun `handles not authenticated on getUser`() {
        assertThrowsUserNotAutheticated { sut.getGithubUser() }
    }

    @Test
    fun `handles not authenticated on checkGithubOrgMembership`() {
        assertThrowsUserNotAutheticated { sut.checkGithubMembership() }
    }
}
