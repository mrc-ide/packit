package packit.unit.controllers

import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.LoginController
import packit.model.LoginWithGithubToken
import packit.service.GithubAPILoginService
import kotlin.test.Test
import kotlin.test.assertEquals

class LoginControllerTest
{
    @Test
    fun `can login with github api token and get packit token`()
    {
        val request = LoginWithGithubToken("fakeToken")

        val mockLoginService = mock<GithubAPILoginService> {
            on { authenticateAndIssueToken(request) } doReturn mapOf("token" to "packitToken")
        }

        val sut = LoginController(mockLoginService, mock())

        val result = sut.loginWithGithub(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, mapOf("token" to "packitToken"))
    }

    @Test
    fun `can get config`()
    {
        val mockAppConfig = mock<AppConfig> {
            on { authEnableGithubLogin } doReturn false
            on { authEnabled } doReturn true
        }

        val sut = LoginController(mock(), mockAppConfig)

        val result = sut.authConfig()

        assertEquals(result.statusCode, HttpStatus.OK)

        val expectedConfig = mapOf(
            "enableGithubLogin" to false,
            "enableAuth" to true
        )
        assertEquals(result.body, expectedConfig)
    }
}
