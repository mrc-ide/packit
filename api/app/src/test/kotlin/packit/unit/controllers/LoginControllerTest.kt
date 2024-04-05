package packit.unit.controllers

import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.LoginController
import packit.model.LoginWithPassword
import packit.model.LoginWithToken
import packit.service.BasicLoginService
import packit.service.GithubAPILoginService
import kotlin.test.Test
import kotlin.test.assertEquals

class LoginControllerTest
{
    @Test
    fun `can login with github api token and get packit token`()
    {
        val request = LoginWithToken("fakeToken")

        val mockLoginService = mock<GithubAPILoginService> {
            on { authenticateAndIssueToken(request) } doReturn mapOf("token" to "packitToken")
        }
        val mockAppConfig = mock<AppConfig> {
            on { authEnableGithubLogin } doReturn true
        }

        val sut = LoginController(mockLoginService, mock(), mockAppConfig)

        val result = sut.loginWithGithub(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, mapOf("token" to "packitToken"))
    }

    @Test
    fun `returns bad request if github login is not enabled`()
    {
        val request = LoginWithToken("fakeToken")

        val mockAppConfig = mock<AppConfig> {
            on { authEnableGithubLogin } doReturn false
        }

        val sut = LoginController(mock(), mock(), mockAppConfig)

        val result = sut.loginWithGithub(request)

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)

        assertEquals(result.body, mapOf("error" to "Github login is not enabled"))
    }

    @Test
    fun `can login with basic auth and get packit token`()
    {
        val request = LoginWithPassword("test@email.com", "password")

        val mockLoginService = mock<BasicLoginService> {
            on { authenticateAndIssueToken(request) } doReturn mapOf("token" to "packitToken")
        }
        val mockAppConfig = mock<AppConfig> {
            on { authEnableBasicLogin } doReturn true
        }

        val sut = LoginController(mock(), mockLoginService, mockAppConfig)

        val result = sut.loginBasic(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, mapOf("token" to "packitToken"))
    }

    @Test
    fun `returns bad request if basic login is not enabled`()
    {
        val request = LoginWithPassword("test@email.com", "password")
        val mockAppConfig = mock<AppConfig> {
            on { authEnableBasicLogin } doReturn false
        }

        val sut = LoginController(mock(), mock(), mockAppConfig)

        val result = sut.loginBasic(request)

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
        assertEquals(result.body, mapOf("error" to "Basic login is not enabled"))
    }

    @Test
    fun `can get config`()
    {
        val mockAppConfig = mock<AppConfig> {
            on { authEnableGithubLogin } doReturn false
            on { authEnabled } doReturn true
            on { authEnableBasicLogin } doReturn true
        }

        val sut = LoginController(mock(), mock(), mockAppConfig)

        val result = sut.authConfig()

        assertEquals(result.statusCode, HttpStatus.OK)

        val expectedConfig = mapOf(
            "enableGithubLogin" to false,
            "enableBasicLogin" to true,
            "enableAuth" to true,
        )
        assertEquals(result.body, expectedConfig)
    }
}
