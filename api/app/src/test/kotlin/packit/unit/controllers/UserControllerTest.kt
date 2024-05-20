package packit.unit.controllers

import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.`when`
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.UserController
import packit.exceptions.PackitException
import packit.model.User
import packit.model.dto.CreateBasicUser
import packit.service.UserRoleService
import packit.service.UserService
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class UserControllerTest
{
    private val testUUID = UUID.randomUUID()
    private val testCreateUser = CreateBasicUser(
        email = "test@email.com",
        password = "password",
        displayName = "displayname",
        userRoles = listOf("ADMIN")
    )
    private val mockConfig = mock<AppConfig> {
        on { authEnableBasicLogin } doReturn true
    }
    private val mockUserService = mock<UserService> {
        on { createBasicUser(testCreateUser) } doReturn User(
            username = testCreateUser.email,
            displayName = testCreateUser.displayName,
            disabled = false,
            userSource = "basic",
            id = testUUID
        )
    }
    private val mockUserRoleService = mock<UserRoleService>()

    @Test
    fun `createBasicUser throws packit exception if basic login is not enabled`()
    {
        `when`(mockConfig.authEnableBasicLogin) doReturn false
        val sut = UserController(mockConfig, mockUserService, mockUserRoleService)

        val ex = assertThrows<PackitException> {
            sut.createBasicUser(testCreateUser)
        }
        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
        assertEquals(ex.key, "basicLoginDisabled")
    }

    @Test
    fun `createBasicUser returns created with user when created`()
    {
        val sut = UserController(mockConfig, mockUserService, mockUserRoleService)

        val result = sut.createBasicUser(testCreateUser)

        assertEquals(result.statusCode, HttpStatus.CREATED)
        assertEquals(testCreateUser.email, result.body?.username)
        assertEquals(testUUID, result.body?.id)
    }
}
