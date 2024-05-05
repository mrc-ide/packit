package packit.unit.controllers

import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.`when`
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.UserController
import packit.exceptions.PackitException
import packit.model.CreateBasicUser
import packit.service.UserService
import kotlin.test.Test
import kotlin.test.assertEquals

class UserControllerTest
{
    private val mockConfig = mock<AppConfig> {
        on { authEnableBasicLogin } doReturn true
    }
    private val mockUserService = mock<UserService>()

    private val testCreateUser = CreateBasicUser(
        email = "test@email.com",
        password = "password",
        displayName = "displayname",
        userRoles = listOf("ADMIN")
    )

    @Test
    fun `createBasicUser throws packit exception if basic login is not enabled`()
    {
        `when`(mockConfig.authEnableBasicLogin) doReturn false
        val sut = UserController(mockConfig, mockUserService)

        val ex = assertThrows<PackitException> {
            sut.createBasicUser(testCreateUser)
        }
        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
        assertEquals(ex.key, "basicLoginDisabled")
    }

    @Test
    fun `createBasicUser returns ok if user is created`()
    {
        val sut = UserController(mockConfig, mockUserService)

        val result = sut.createBasicUser(testCreateUser)

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mapOf("message" to "User created"))
    }
}
