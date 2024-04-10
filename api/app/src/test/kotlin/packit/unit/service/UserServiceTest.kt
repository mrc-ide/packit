package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.`when`
import org.mockito.kotlin.argThat
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.security.crypto.password.PasswordEncoder
import packit.model.CreateBasicUser
import packit.model.User
import packit.model.UserGroup
import packit.repository.UserGroupRepository
import packit.repository.UserRepository
import packit.security.Role
import packit.service.BaseUserService
import java.time.Instant
import kotlin.test.assertEquals

class UserServiceTest
{
    private val userGroups = listOf(UserGroup(Role.USER), UserGroup(Role.ADMIN))
    private val mockUserRepository = mock<UserRepository>()
    private val passwordEncoder = mock<PasswordEncoder>()
    private val mockUserGroupRepository = mock<UserGroupRepository> {
        on { findByRole(Role.USER) } doReturn userGroups[0]
        on { findByRole(Role.ADMIN) } doReturn userGroups[1]
        on { findAll() } doReturn userGroups
    }
    private val createBasicUser = CreateBasicUser(
        email = "email",
        password = "password",
        displayName = "displayName",
        userRoles = listOf(Role.USER, Role.ADMIN)
    )

    @Test
    fun `getUserRoleUserGroup gets user role user group`()
    {
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val userRoleUserGroup = service.getUserRoleUserGroup()

        assertEquals(userRoleUserGroup, userGroups[0])
    }

    @Test
    fun `getAdminRoleUserGroup gets admin role user group`()
    {
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val adminRoleUserGroup = service.getAdminRoleUserGroup()

        assertEquals(adminRoleUserGroup, userGroups[1])
    }

    @Test
    fun `getAdminRoleUserGroup returns user from repository if found`()
    {
        val existingUser = "username"
        val mockUser = mock<User>()
        `when`(mockUserRepository.findByUsername(existingUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val user = service.saveUserFromGithub("username", "displayName", "email")

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(existingUser)
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
            lastLoggedIn = Instant.now().toString(),
            userGroups = mutableListOf(userGroups[0]),
        )
        `when`(mockUserRepository.findByUsername(newUser.username)).doReturn(null)
        `when`(mockUserRepository.save(newUser)).doReturn(newUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val user = service.saveUserFromGithub(newUser.username, "displayName", "email")

        assertEquals(user.displayName, newUser.displayName)
        verify(mockUserGroupRepository).findByRole(Role.USER)
        verify(mockUserRepository).findByUsername(newUser.username)
        verify(mockUserRepository).save(argThat { this.username == newUser.username })
    }

    @Test
    fun ` throws error if CreateBasicUser roles dont match db`()
    {
        `when`(mockUserGroupRepository.findAll()).doReturn(listOf(userGroups[0]))
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val exception = assertThrows<IllegalArgumentException> { service.getFoundUserGroups(createBasicUser) }

        assertEquals(exception.message, "Invalid roles provided")
    }

    @Test
    fun `getFoundUserGroups returns found user groups when no conflicts with roles`()
    {
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val foundUserGroups = service.getFoundUserGroups(createBasicUser)

        assertEquals(foundUserGroups, userGroups)
    }

    @Test
    fun `createBasicUser throws error if user already exists`()
    {
        `when`(mockUserRepository.findByUsername(createBasicUser.email)).doReturn(mock())
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        assertThrows<java.lang.IllegalArgumentException> { service.createBasicUser(createBasicUser) }
        verify(mockUserRepository).findByUsername(createBasicUser.email)
    }

    @Test
    fun `createBasicUser creates new user if user does not exist`()
    {

        `when`(passwordEncoder.encode(createBasicUser.password)).doReturn("encodedPassword")
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        service.createBasicUser(createBasicUser)

        verify(mockUserRepository).findByUsername(createBasicUser.email)
        verify(mockUserGroupRepository).findAll()
        verify(passwordEncoder).encode(createBasicUser.password)
        verify(mockUserRepository).save(
            argThat {
            this.username == createBasicUser.email
            this.password == "encodedPassword"
            !this.disabled
            this.displayName == createBasicUser.displayName
            this.email == createBasicUser.email
            this.userSource == "basic"
            this.lastLoggedIn == Instant.now().toString()
            this.userGroups == userGroups
        }
        )
    }
}
