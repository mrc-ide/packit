package packit.unit.controllers

import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.LoginController
import packit.exceptions.PackitException
import packit.model.dto.LoginWithPassword
import packit.model.dto.LoginWithToken
import packit.model.dto.UpdatePassword
import packit.service.BasicLoginService
import packit.service.GithubAPILoginService
import packit.service.UserService
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

        val sut = LoginController(mockLoginService, mock(), mock(), mock(), mockAppConfig, mock())

        val result = sut.loginWithGithub(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, mapOf("token" to "packitToken"))
    }

    @Test
    fun `throws packit exception  if github login is not enabled`()
    {
        val request = LoginWithToken("fakeToken")

        val mockAppConfig = mock<AppConfig> {
            on { authEnableGithubLogin } doReturn false
        }

        val sut = LoginController(mock(), mock(), mock(), mock(), mockAppConfig, mock())

        val ex = assertThrows<PackitException> {
            sut.loginWithGithub(request)
        }

        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
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

        val sut = LoginController(mock(), mock(), mockLoginService, mock(), mockAppConfig, mock())

        val result = sut.loginBasic(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, mapOf("token" to "packitToken"))
    }

    @Test
    fun `throws packit exception if basic login is not enabled`()
    {
        val request = LoginWithPassword("test@email.com", "password")
        val mockAppConfig = mock<AppConfig> {
            on { authEnableBasicLogin } doReturn false
        }

        val sut = LoginController(mock(), mock(), mock(), mock(), mockAppConfig, mock())

        val ex = assertThrows<PackitException> {
            sut.loginBasic(request)
        }

        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
    }

    @Test
    fun `can get config`()
    {
        val mockAppConfig = mock<AppConfig> {
            on { authEnableGithubLogin } doReturn false
            on { authEnabled } doReturn true
            on { authEnableBasicLogin } doReturn true
        }

        val sut = LoginController(mock(), mock(), mock(), mock(), mockAppConfig, mock())

        val result = sut.authConfig()

        assertEquals(result.statusCode, HttpStatus.OK)

        val expectedConfig = mapOf(
            "enableGithubLogin" to false,
            "enableBasicLogin" to true,
            "enablePreAuthLogin" to false,
            "enableAuth" to true,
        )
        assertEquals(result.body, expectedConfig)
    }

    @Test
    fun `updatePassword throws packit exception if basic login is not enabled`()
    {
        val mockAppConfig = mock<AppConfig> {
            on { authEnableBasicLogin } doReturn false
        }

        val sut = LoginController(mock(), mock(), mock(), mock(), mockAppConfig, mock())

        val ex = assertThrows<PackitException> {
            sut.updatePassword("user@email", UpdatePassword("current", "newpassword"))
        }
        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
        assertEquals(ex.key, "basicLoginDisabled")
    }

    @Test
    fun `updatePassword calls userService updatePassword`()
    {
        val mockAppConfig = mock<AppConfig> {
            on { authEnableBasicLogin } doReturn true
        }
        val mockUserService = mock<UserService>()
        val updatePassword = UpdatePassword("current", "newpassword")
        val sut = LoginController(mock(), mock(), mock(), mock(), mockAppConfig, mockUserService)

        sut.updatePassword("test@email.com", updatePassword)

        verify(mockUserService).updatePassword("test@email.com", updatePassword)
    }
}
