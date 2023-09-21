package packit.unit.controllers

import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.LoginController
import packit.model.LoginRequest
import packit.service.UserLoginService
import kotlin.test.Test
import kotlin.test.assertEquals

class LoginControllerTest
{
    @Test
    fun `can login and get token`()
    {
        val request = LoginRequest("test@example.com", "test")

        val mockUserLoginService = mock<UserLoginService> {
            on { authenticateAndIssueToken(request) } doReturn "Token"
        }

        val sut = LoginController(mockUserLoginService)

        val result = sut.login(request)

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, "Token")
    }

    @Test
    fun `can get config`()
    {
        val fakeResponse = mapOf("method" to true)

        val mockUserLoginService = mock<UserLoginService> {
            on { authConfig() } doReturn fakeResponse
        }

        val sut = LoginController(mockUserLoginService)

        val result = sut.authConfig()

        assertEquals(result.statusCode, HttpStatus.OK)

        assertEquals(result.body, fakeResponse)
    }
}
