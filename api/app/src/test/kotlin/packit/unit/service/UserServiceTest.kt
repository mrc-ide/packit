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
    private val userRole = Role("USER")
    private val adminRole = Role("ADMIN")
    private val testRoles = listOf(userRole, adminRole)
    private val mockUserRepository = mock<UserRepository>() {
        on { save(any<User>()) } doAnswer { it.getArgument(0) }
    }

    private val passwordEncoder = mock<PasswordEncoder>()
    private val createBasicUser = CreateBasicUser(
        email = "email",
        password = "password",
        displayName = "displayName",
        userRoles = listOf("USER", "ADMIN")
    )
    private val mockGitHubUser = User(
        username = "githubuser",
        displayName = "displayName",
        disabled = false,
        email = "email",
        userSource = "github",
        lastLoggedIn = Instant.parse("2018-12-12T00:00:00Z"),
        roles = mutableListOf(userRole),
    )
    private val mockBasicUser = User(
        username = "basicuser",
        displayName = "displayName",
        disabled = false,
        email = "email",
        userSource = "basic",
        lastLoggedIn = Instant.parse("2018-12-12T00:00:00Z"),
        roles = mutableListOf(userRole),
    )
    private val mockServiceUser = User(
        username = "service",
        displayName = "Service Account",
        disabled = false,
        userSource = "service"
    )
    private val mockRoleService = mock<RoleService> {
        on { getRolesByRoleNames(createBasicUser.userRoles) } doReturn testRoles
        on { createUsernameRole(any()) } doAnswer { Role(it.getArgument(0), isUsername = true) }
    }

    @Test
    fun `saveUserFromGithub returns user from repository if found & does not call saveUserFromGithub`()
    {
        `when`(mockUserRepository.findByUsername(mockGitHubUser.username)).doReturn(mockGitHubUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val user = service.saveUserFromGithub(
            mockGitHubUser.username,
            mockGitHubUser.displayName,
            mockGitHubUser.email
        )

        assertEquals(user, mockGitHubUser)
        verify(mockUserRepository).findByUsername(mockGitHubUser.username)
        verify(mockUserRepository).save(argThat { this == mockGitHubUser })
        verify(mockRoleService, never()).createUsernameRole(any<String>())
    }

    @Test
    fun `saveUserFromGithub creates new user & returns if not found in repository`()
    {
        `when`(mockUserRepository.findByUsername(mockGitHubUser.username)).doReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val user = service.saveUserFromGithub(
            mockGitHubUser.username,
            mockGitHubUser.displayName,
            mockGitHubUser.email
        )

        assertEquals(user.displayName, mockGitHubUser.displayName)
        verify(mockRoleService).createUsernameRole(mockGitHubUser.username)
        verify(mockUserRepository).save(argThat { this.username == mockGitHubUser.username })
    }

    @Test
    fun `saveUserFromGithub adds default roles when creating a user`()
    {
        whenever(mockRoleService.getDefaultRoles()).doReturn(listOf(userRole))
        whenever(mockUserRepository.findByUsername(mockGitHubUser.username)).doReturn(null)

        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)
        service.saveUserFromGithub(
            mockGitHubUser.username,
            mockGitHubUser.displayName,
            mockGitHubUser.email
        )

        verify(mockUserRepository).save(
            argThat {
                assertEquals(this.roles.map { it.name }, listOf("USER", mockGitHubUser.username))
                true
            }
        )
    }

    @Test
    fun `saveUserFromGithub does not add default role to existing users`()
    {
        whenever(mockRoleService.getDefaultRoles()).doReturn(listOf(adminRole))
        whenever(mockUserRepository.findByUsername(mockGitHubUser.username)).doReturn(mockGitHubUser)

        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)
        val user = service.saveUserFromGithub(
            mockGitHubUser.username,
            mockGitHubUser.displayName,
            mockGitHubUser.email
        )

        assertFalse(user.roles.map { it.name }.contains("ADMIN"))

        assertEquals(user, mockGitHubUser)
        verify(mockUserRepository).findByUsername(mockGitHubUser.username)
        verify(mockUserRepository).save(mockGitHubUser)
    }

    @Test
    fun `saveUserFromGithub throws exception if user exists but is not from github`()
    {
        whenever(mockUserRepository.findByUsername(mockBasicUser.username)).doReturn(mockBasicUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex = assertThrows<PackitException> {
            service.saveUserFromGithub(
                mockBasicUser.username,
                mockBasicUser.displayName,
                mockBasicUser.email
            )
        }
        assertEquals(ex.key, "userAlreadyExists")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)

        verify(mockUserRepository, never()).save(any<User>())
        verify(mockRoleService, never()).createUsernameRole(any<String>())
    }

    @Test
    fun `updateUserLastLoggedIn updates lastLoggedIn field of user`()
    {
        mockBasicUser.lastLoggedIn = Instant.parse("2018-12-12T00:00:00Z")
        val lastLoggedIn = Instant.now()
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val updatedUser = service.updateUserLastLoggedIn(mockBasicUser, lastLoggedIn)

        assertEquals(updatedUser.lastLoggedIn, lastLoggedIn)
        verify(mockUserRepository).save(mockBasicUser)
    }

    @Test
    fun `getUserForBasicLogin gets user from repository`()
    {
        `when`(mockUserRepository.findByUsernameAndUserSource(mockBasicUser.username, "basic")).doReturn(mockBasicUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val user = service.getUserForBasicLogin(mockBasicUser.username)

        assertEquals(user, mockBasicUser)
        verify(mockUserRepository).findByUsernameAndUserSource(mockBasicUser.username, "basic")
    }

    @Test
    fun `getUserForBasicLogin throws exception if user not found`()
    {
        `when`(mockUserRepository.findByUsernameAndUserSource(mockBasicUser.username, "basic")).doReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        assertThrows<AuthenticationException> { service.getUserForBasicLogin(mockBasicUser.username) }

        verify(mockUserRepository).findByUsernameAndUserSource(mockBasicUser.username, "basic")
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
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.createBasicUser(createBasicUser)

        verify(mockRoleService).getRolesByRoleNames(createBasicUser.userRoles)
        verify(mockRoleService).createUsernameRole(createBasicUser.email)
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
    fun `createBasicUser adds default roles to user`()
    {
        whenever(mockRoleService.getDefaultRoles()).doReturn(listOf(userRole))

        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val result = service.createBasicUser(
            CreateBasicUser(
            email = "email",
            password = "password",
            displayName = "displayName",
            userRoles = listOf()
        )
        )
        verify(mockUserRepository).save(
            argThat {
            assertEquals(this.roles.map { it.name }, listOf("USER", "email"))
            true
        }
        )
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

    @Test
    fun `getServiceUser returns service user`()
    {
        whenever(mockUserRepository.findByUsernameAndUserSource("SERVICE", "service")).thenReturn(mockServiceUser)

        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)
        assertEquals(service.getServiceUser(), mockServiceUser)
    }
}
