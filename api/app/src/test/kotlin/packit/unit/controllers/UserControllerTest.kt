package packit.unit.controllers

import org.mockito.Mockito.`when`
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.AppConfig
import packit.controllers.UserController
import packit.model.CreateBasicUser
import packit.security.Role
import packit.service.UserService
import kotlin.test.Test
import kotlin.test.assertEquals

class UserControllerTest
{
    private val mockConfig = mock<AppConfig> {
        on { authEnableBasicLogin } doReturn true
    }
    private val mockUserService = mock<UserService>()
    private val mockAuthentication = mock<Authentication> {
        on { authorities } doReturn mutableListOf(SimpleGrantedAuthority(Role.ADMIN.toString()))
    }
    private val testUser = CreateBasicUser(
        email = "test@email.com",
        password = "password",
        displayName = "displayname",
        userRoles = listOf(Role.USER, Role.ADMIN)
    )

    @Test
    fun `createBasicUser returns forbidden if user does not have admin role`()
    {
        `when`(mockAuthentication.authorities).doReturn(mutableListOf(SimpleGrantedAuthority(Role.USER.toString())))
        val sut = UserController(mockConfig, mockUserService)

        val result = sut.createBasicUser(testUser, mockAuthentication)

        assertEquals(result.statusCode, HttpStatus.FORBIDDEN)
        assertEquals(result.body, mapOf("error" to "Only admins can create users"))
    }

    @Test
    fun `createBasicUser returns bad request if basic login is not enabled`()
    {
        `when`(mockConfig.authEnableBasicLogin).doReturn(false)
        val sut = UserController(mockConfig, mockUserService)

        val result = sut.createBasicUser(testUser, mockAuthentication)

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
        assertEquals(result.body, mapOf("error" to "Basic login is not enabled"))
    }

    @Test
    fun `createBasicUser returns bad request if user creation fails`()
    {
        `when`(mockUserService.createBasicUser(testUser)).thenThrow(IllegalArgumentException("User already exists"))
        val sut = UserController(mockConfig, mockUserService)

        val result = sut.createBasicUser(testUser, mockAuthentication)

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
        assertEquals(result.body, mapOf("error" to "User already exists"))
    }

    @Test
    fun `createBasicUser returns ok if user is created`()
    {
        val sut = UserController(mockConfig, mockUserService)

        val result = sut.createBasicUser(testUser, mockAuthentication)

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mapOf("message" to "User created"))
    }
}
