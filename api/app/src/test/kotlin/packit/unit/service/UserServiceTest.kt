package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.`when`
import org.mockito.kotlin.argThat
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import packit.exceptions.PackitException
import packit.model.CreateBasicUser
import packit.model.User
import packit.model.UserGroup
import packit.repository.UserGroupRepository
import packit.repository.UserRepository
import packit.security.Role
import packit.service.BaseUserService
import java.time.Instant
import java.time.LocalDate
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
    private val mockUser = User(
        username = "username",
        displayName = "displayName",
        disabled = false,
        email = "email",
        userSource = "github",
        lastLoggedIn = LocalDate.parse("2018-12-12").toString(),
        userGroups = mutableListOf(userGroups[0]),
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
    fun `findByUsername returns user from repository if found & updates latest time`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val user = service.saveUserFromGithub("username", "displayName", "email")

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this == mockUser })
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

        val user = service.saveUserFromGithub(mockUser.username, "displayName", "email")

        assertEquals(user.displayName, mockUser.displayName)
        verify(mockUserGroupRepository).findByRole(Role.USER)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this.username == mockUser.username })
    }

    @Test
    fun `updateUserLastLoggedIn updates lastLoggedIn field of user`()
    {
        mockUser.lastLoggedIn = LocalDate.parse("2018-12-12").toString()
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val lastLoggedIn = Instant.now().toString()
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val updatedUser = service.updateUserLastLoggedIn(mockUser, lastLoggedIn)

        assertEquals(updatedUser.lastLoggedIn, lastLoggedIn)
        verify(mockUserRepository).save(mockUser)
    }

    @Test
    fun `getUserForLogin gets user from repository & updates latest time`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val user = service.getUserForLogin(mockUser.username)

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this == mockUser })
    }

    @Test
    fun `getUserForLogin throws exception if user not found`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(null)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val ex = assertThrows<PackitException> { service.getUserForLogin(mockUser.username) }

        assertEquals(ex.key, "userNotFound")
        verify(mockUserRepository).findByUsername(mockUser.username)
    }

    @Test
    fun ` throws error if CreateBasicUser roles dont match db`()
    {
        `when`(mockUserGroupRepository.findAll()).doReturn(listOf(userGroups[0]))
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository, passwordEncoder)

        val exception = assertThrows<PackitException> { service.getFoundUserGroups(createBasicUser) }

        assertEquals(exception.key, "invalidRolesProvided")
        assertEquals(exception.httpStatus, HttpStatus.BAD_REQUEST)
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

        val ex = assertThrows<PackitException> { service.createBasicUser(createBasicUser) }

        verify(mockUserRepository).findByUsername(createBasicUser.email)
        assertEquals(ex.key, "userAlreadyExists")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
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
