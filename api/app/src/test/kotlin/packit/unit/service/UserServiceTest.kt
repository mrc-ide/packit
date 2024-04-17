package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.`when`
import org.mockito.kotlin.*
import packit.exceptions.PackitException
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
    private val mockUserGroupRepository = mock<UserGroupRepository> {
        on { findByRole(Role.USER) } doReturn userGroups[0]
        on { findByRole(Role.ADMIN) } doReturn userGroups[1]
    }
    private val mockUser = User(
        username = "username",
        displayName = "displayName",
        disabled = false,
        email = "email",
        userSource = "github",
//        1 month ago
        lastLoggedIn = LocalDate.parse("2018-12-12").toString(),
        userGroups = mutableListOf(userGroups[0]),
    )

    @Test
    fun `getUserRoleUserGroup gets user role user group`()
    {
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

        val userRoleUserGroup = service.getUserRoleUserGroup()

        assertEquals(userRoleUserGroup, userGroups[0])
    }

    @Test
    fun `getAdminRoleUserGroup gets admin role user group`()
    {
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

        val adminRoleUserGroup = service.getAdminRoleUserGroup()

        assertEquals(adminRoleUserGroup, userGroups[1])
    }

    @Test
    fun `findByUsername returns user from repository if found & updates latest time`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

        val user = service.saveUserFromGithub("username", "displayName", "email")

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this == mockUser })
    }

    @Test
    fun `saveUserFromGithub creates new user & returns if not found in repository`()
    {
        whenever(mockUserRepository.findByUsername(mockUser.username)).doReturn(null)
        whenever(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

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
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

        val updatedUser = service.updateUserLastLoggedIn(mockUser, lastLoggedIn)

        assertEquals(updatedUser.lastLoggedIn, lastLoggedIn)
        verify(mockUserRepository).save(mockUser)
    }

    @Test
    fun `getUserForLogin gets user from repository & updates latest time`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

        val user = service.getUserForLogin(mockUser.username)

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this == mockUser })
    }

    @Test
    fun `getUserForLogin throws exception if user not found`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(null)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

        val ex = assertThrows<PackitException> { service.getUserForLogin(mockUser.username) }

        assertEquals(ex.key, "userNotFound")
        verify(mockUserRepository).findByUsername(mockUser.username)
    }
}
