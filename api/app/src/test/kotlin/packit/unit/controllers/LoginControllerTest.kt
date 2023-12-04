package packit.unit.controllers

import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.LoginController
import packit.model.LoginRequest
import packit.model.LoginWithGithubToken
import packit.service.BasicUserLoginService
import packit.service.GithubAPILoginService
import kotlin.test.Test
import kotlin.test.assertEquals

class LoginControllerTest
{
    @Test
    fun `can login and get token`()
    {
        val request = LoginRequest("test@example.com", "test")

        val mockUserLoginService = mock<BasicUserLoginService> {
            on { authenticateAndIssueToken(request) } doReturn mapOf("token" to "fakeToken")
        }

        val sut = LoginController(mockUserLoginService, mock())

        val result = sut.login(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, mapOf("token" to "fakeToken"))
    }

    @Test
    fun `can login with github api token and get packit token`()
    {
        val request = LoginWithGithubToken("fakeToken")

        val mockLoginService = mock<GithubAPILoginService> {
            on { authenticateAndIssueToken(request) } doReturn mapOf("token" to "packitToken")
        }

        val sut = LoginController(mock(), mockLoginService)

        val result = sut.loginWithGithub(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, mapOf("token" to "packitToken"))
    }

    @Test
    fun `can get config`()
    {
        val fakeResponse = mapOf("method" to true)

        val mockUserLoginService = mock<BasicUserLoginService> {
            on { authConfig() } doReturn fakeResponse
        }

        val sut = LoginController(mockUserLoginService, mock())

        val result = sut.authConfig()

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, fakeResponse)
    }
}
