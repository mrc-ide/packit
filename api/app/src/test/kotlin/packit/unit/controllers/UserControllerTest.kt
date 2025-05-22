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
import packit.model.dto.CreateExternalUser
import packit.model.toDto
import packit.service.UserRoleService
import packit.service.UserService
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class UserControllerTest {
    private val testUUID = UUID.randomUUID()
    private val testCreateUser = CreateBasicUser(
        email = "test@email.com",
        password = "password",
        displayName = "displayname",
        userRoles = listOf("ADMIN")
    )

    private val testCreateExternalUser = CreateExternalUser(
        username = "external.user",
        email = "external@email.com",
        displayName = "external displayname",
        userRoles = listOf("ADMIN")
    )

    private val testExternalUser = User(
        username = testCreateExternalUser.username,
        email = testCreateExternalUser.email,
        displayName = testCreateExternalUser.displayName,
        disabled = false,
        userSource = "preauth",
        id = testUUID
    )

    private val mockConfig = mock<AppConfig> {
        on { authEnabled } doReturn true
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
        on { createExternalUser(testCreateExternalUser, "preauth") } doReturn testExternalUser
    }
    private val mockUserRoleService = mock<UserRoleService>()

    @Test
    fun `createBasicUser throws packit exception if basic login is not enabled`() {
        `when`(mockConfig.authEnableBasicLogin) doReturn false
        val sut = UserController(mockConfig, mockUserService, mockUserRoleService)

        val ex = assertThrows<PackitException> {
            sut.createBasicUser(testCreateUser)
        }
        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
        assertEquals(ex.key, "basicLoginDisabled")
    }

    @Test
    fun `createBasicUser returns created with user when created`() {
        val sut = UserController(mockConfig, mockUserService, mockUserRoleService)

        val result = sut.createBasicUser(testCreateUser)

        assertEquals(result.statusCode, HttpStatus.CREATED)
        assertEquals(testCreateUser.email, result.body?.username)
        assertEquals(testUUID, result.body?.id)
    }

    @Test
    fun `createExternalUser returns created with user when created`() {
        `when`(mockConfig.authEnableBasicLogin) doReturn false
        `when`(mockConfig.authMethod) doReturn "preauth"
        val sut = UserController(mockConfig, mockUserService, mockUserRoleService)

        val result = sut.createExternalUser(testCreateExternalUser)

        assertEquals(HttpStatus.CREATED, result.statusCode)
        assertEquals(testExternalUser.toDto(), result.body)
    }

    @Test
    fun `createExternalUser throws packit exception if basic login is enabled`() {
        `when`(mockConfig.authEnableBasicLogin) doReturn true
        val sut = UserController(mockConfig, mockUserService, mockUserRoleService)

        val ex = assertThrows<PackitException> {
            sut.createExternalUser(testCreateExternalUser)
        }
        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
        assertEquals(ex.key, "externalLoginDisabled")
    }

    @Test
    fun `createExternalUser throws packit exception if auth is not enabled`() {
        `when`(mockConfig.authEnabled) doReturn false
        val sut = UserController(mockConfig, mockUserService, mockUserRoleService)

        val ex = assertThrows<PackitException> {
            sut.createExternalUser(testCreateExternalUser)
        }
        assertEquals(ex.httpStatus, HttpStatus.FORBIDDEN)
        assertEquals(ex.key, "externalLoginDisabled")
    }
}
