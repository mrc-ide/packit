package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.anyList
import org.mockito.Mockito.`when`
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import packit.exceptions.PackitAuthenticationException
import packit.exceptions.PackitException
import packit.model.Role
import packit.model.User
import packit.model.dto.CreateBasicUser
import packit.model.dto.UpdatePassword
import packit.repository.UserRepository
import packit.service.BaseUserService
import packit.service.RoleService
import java.time.Instant
import javax.naming.AuthenticationException
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class UserServiceTest
{
    private val testRoles = listOf(Role("USER"), Role("ADMIN"))
    private val mockUserRepository = mock<UserRepository>()
    private val passwordEncoder = mock<PasswordEncoder>()
    private val createBasicUser = CreateBasicUser(
        email = "email",
        password = "password",
        displayName = "displayName",
        userRoles = listOf("USER", "ADMIN")
    )
    private val mockUser = User(
        username = "username",
        displayName = "displayName",
        disabled = false,
        email = "email",
        userSource = "github",
        lastLoggedIn = Instant.parse("2018-12-12T00:00:00Z"),
        roles = mutableListOf(testRoles[0]),
    )
    private val mockRoleService = mock<RoleService> {
        on { getRolesByRoleNames(createBasicUser.userRoles) } doReturn testRoles
        on { getUsernameRole(createBasicUser.email) } doReturn Role(createBasicUser.email, isUsername = true)
    }

    @Test
    fun `saveUserFromGithub returns user from repository if found & does not call saveUserFromGithub`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val user = service.saveUserFromGithub("username", "displayName", "email")

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this == mockUser })
        verify(mockRoleService, never()).getUsernameRole(mockUser.username)
    }

    @Test
    fun `saveUserFromGithub creates new user & returns if not found in repository`()
    {
        val newUser = User(
            username = "username",
            displayName = "displayName",
            disabled = false,
            email = "email",
            userSource = "github",
            lastLoggedIn = Instant.now(),
            roles = mutableListOf(testRoles[0]),
        )
        `when`(mockUserRepository.findByUsername(newUser.username)).doReturn(null)
        `when`(mockUserRepository.save(newUser)).doReturn(newUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val user = service.saveUserFromGithub(mockUser.username, "displayName", "email")

        assertEquals(user.displayName, mockUser.displayName)
        verify(mockRoleService).getUsernameRole(newUser.username)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this.username == mockUser.username })
    }

    @Test
    fun `updateUserLastLoggedIn updates lastLoggedIn field of user`()
    {
        mockUser.lastLoggedIn = Instant.parse("2018-12-12T00:00:00Z")
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val lastLoggedIn = Instant.now()
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val updatedUser = service.updateUserLastLoggedIn(mockUser, lastLoggedIn)

        assertEquals(updatedUser.lastLoggedIn, lastLoggedIn)
        verify(mockUserRepository).save(mockUser)
    }

    @Test
    fun `getUserForLogin gets user from repository`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val user = service.getUserForLogin(mockUser.username)

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(mockUser.username)
    }

    @Test
    fun `getUserForLogin throws exception if user not found`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<AuthenticationException> { service.getUserForLogin(mockUser.username) }

        verify(mockUserRepository).findByUsername(mockUser.username)
    }

    @Test
    fun `createBasicUser throws error if user already exists`()
    {
        `when`(mockUserRepository.existsByUsername(createBasicUser.email)).doReturn(true)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex = assertThrows<PackitException> { service.createBasicUser(createBasicUser) }

        verify(mockUserRepository).existsByUsername(createBasicUser.email)
        assertEquals(ex.key, "userAlreadyExists")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `createBasicUser creates new user if user does not exist`()
    {

        `when`(passwordEncoder.encode(createBasicUser.password)).doReturn("encodedPassword")
        `when`(mockUserRepository.existsByUsername(createBasicUser.email)).doReturn(false)
        `when`(mockUserRepository.save(any<User>())).thenAnswer { it.getArgument(0) }
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.createBasicUser(createBasicUser)

        verify(mockRoleService).getRolesByRoleNames(createBasicUser.userRoles)
        verify(mockRoleService).getUsernameRole(createBasicUser.email)
        verify(passwordEncoder).encode(createBasicUser.password)
        verify(mockUserRepository).save(
            argThat {
                assertEquals(this.username, createBasicUser.email)
                assertEquals(this.password, "encodedPassword")
                assertFalse(this.disabled)
                assertEquals(this.displayName, createBasicUser.displayName)
                assertEquals(this.email, createBasicUser.email)
                assertEquals(this.userSource, "basic")
                assertNull(this.lastLoggedIn)
                assertEquals(this.roles, testRoles.plus(Role(createBasicUser.email, isUsername = true)))
                true
            }
        )
        assertEquals(result.username, createBasicUser.email)
    }

    @Test
    fun `getUsersByUsernames returns all users when all usernames exist in repository`()
    {
        val usernames = listOf("user1", "user2", "user3")
        val users =
            usernames.map { User(username = it, displayName = "displayName", disabled = false, userSource = "github") }
        whenever(mockUserRepository.findByUsernameIn(usernames)).thenReturn(users)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.getUsersByUsernames(usernames)

        assertEquals(users, result)
    }

    @Test
    fun `getUsersByUsernames throws exception when some usernames do not exist in repository`()
    {
        val existingUsernames = listOf("user1", "user2")
        val nonExistingUsernames = listOf("user3", "user4")
        val users = existingUsernames.map {
            User(
                username = it,
                displayName = "displayName",
                disabled = false,
                userSource = "github"
            )
        }
        whenever(mockUserRepository.findByUsernameIn(anyList())).thenReturn(users)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<PackitException> { service.getUsersByUsernames(existingUsernames + nonExistingUsernames) }.apply {
            assertEquals("invalidUsersProvided", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getUsersByUsernames throws exception when no usernames exist in repository`()
    {
        val usernames = listOf("user1", "user2", "user3")
        whenever(mockUserRepository.findByUsernameIn(anyList())).thenReturn(emptyList())
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<PackitException> { service.getUsersByUsernames(usernames) }.apply {
            assertEquals("invalidUsersProvided", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getByUsername returns user when user exists in repository`()
    {
        val username = "existingUser"
        val user = User(username = username, displayName = "displayName", disabled = false, userSource = "github")
        whenever(mockUserRepository.findByUsername(username)).thenReturn(user)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.getByUsername(username)

        assertEquals(user, result)
    }

    @Test
    fun `getByUsername returns null when user does not exist in repository`()
    {
        val username = "nonExistingUser"
        whenever(mockUserRepository.findByUsername(username)).thenReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.getByUsername(username)

        assertNull(result)
    }

    @Test
    fun `saveUser saves and returns user`()
    {
        val user = User(username = "username", displayName = "displayName", disabled = false, userSource = "github")
        whenever(mockUserRepository.save(user)).thenReturn(user)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.saveUser(user)

        assertEquals(user, result)
    }

    @Test
    fun `saveUsers saves and returns all users`()
    {
        val users = listOf(
            User(username = "user1", displayName = "displayName1", disabled = false, userSource = "github"),
            User(username = "user2", displayName = "displayName2", disabled = false, userSource = "github")
        )
        whenever(mockUserRepository.saveAll(users)).thenReturn(users)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.saveUsers(users)

        assertEquals(users, result)
    }

    @Test
    fun `deleteUser removes user when user exists in repository`()
    {
        val username = "existingUser"
        val user = User(username = username, displayName = "displayName", disabled = false, userSource = "github")
        whenever(mockUserRepository.findByUsername(username)).thenReturn(user)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        service.deleteUser(username)

        verify(mockUserRepository).delete(user)
        verify(mockRoleService).deleteUsernameRole(username)
    }

    @Test
    fun `deleteUser throws exception when user does not exist in repository`()
    {
        val username = "nonExistingUser"
        whenever(mockUserRepository.findByUsername(username)).thenReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<PackitException> { service.deleteUser(username) }.apply {
            assertEquals("userNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
    }

    @Test
    fun `updatePassword updates password when current password is correct`()
    {
        val username = "existingUser"
        val currentPassword = "currentPassword"
        val newPassword = "newPassword"
        val user = User(
            username = username,
            password = passwordEncoder.encode(currentPassword),
            userSource = "basic",
            disabled = false,
            displayName = "displayName"
        )
        whenever(mockUserRepository.findByUsername(username)).thenReturn(user)
        whenever(passwordEncoder.matches(currentPassword, user.password)).thenReturn(true)
        whenever(mockUserRepository.save(user)).thenAnswer { it.getArgument(0) }
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        service.updatePassword(username, UpdatePassword(currentPassword, newPassword))

        verify(passwordEncoder).encode(newPassword)
        verify(mockUserRepository).save(user)
        assertNotNull(user.lastLoggedIn)
    }

    @Test
    fun `updatePassword throws exception when user does not exist`()
    {
        val username = "nonExistingUser"
        val currentPassword = "currentPassword"
        val newPassword = "newPassword"
        whenever(mockUserRepository.findByUsername(username)).thenReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<PackitException> {
            service.updatePassword(
                username,
                UpdatePassword(currentPassword, newPassword)
            )
        }.apply {
            assertEquals("userNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
    }

    @Test
    fun `updatePassword throws exception when current password is incorrect`()
    {
        val username = "existingUser"
        val currentPassword = "incorrectPassword"
        val newPassword = "newPassword"
        val user = User(
            username = username,
            password = passwordEncoder.encode("correctPassword"),
            userSource = "basic",
            disabled = false,
            displayName = "displayName"
        )
        whenever(mockUserRepository.findByUsername(username)).thenReturn(user)
        whenever(passwordEncoder.matches(currentPassword, user.password)).thenReturn(false)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<PackitException> {
            service.updatePassword(
                username,
                UpdatePassword(currentPassword, newPassword)
            )
        }.apply {
            assertEquals("invalidPassword", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `checkAndUpdateLastLoggedIn updates lastLoggedIn when user exists and lastLoggedIn is not null`()
    {
        val username = "existingUser"
        val user = User(
            username = username,
            displayName = "displayName",
            disabled = false,
            userSource = "github",
            lastLoggedIn = Instant.now()
        )
        whenever(mockUserRepository.findByUsername(username)).thenReturn(user)
        whenever(mockUserRepository.save(any<User>())).thenReturn(user)

        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        service.checkAndUpdateLastLoggedIn(username)

        verify(mockUserRepository).save(user)
    }

    @Test
    fun `checkAndUpdateLastLoggedIn throws exception when user does not exist`()
    {
        val username = "nonExistingUser"
        whenever(mockUserRepository.findByUsername(username)).thenReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<PackitException> { service.checkAndUpdateLastLoggedIn(username) }.apply {
            assertEquals("userNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
    }

    @Test
    fun `checkAndUpdateLastLoggedIn throws exception when lastLoggedIn is null`()
    {
        val username = "existingUser"
        val user = User(
            username = username,
            displayName = "displayName",
            disabled = false,
            userSource = "github",
            lastLoggedIn = null
        )
        whenever(mockUserRepository.findByUsername(username)).thenReturn(user)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<PackitAuthenticationException> { service.checkAndUpdateLastLoggedIn(username) }.apply {
            assertEquals("updatePassword", key)
            assertEquals(HttpStatus.FORBIDDEN, httpStatus)
        }
    }
}
