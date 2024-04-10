package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
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
    private val mockUserGroupRepository = mock<UserGroupRepository> {
        on { findByRole(Role.USER) } doReturn userGroups[0]
        on { findByRole(Role.ADMIN) } doReturn userGroups[1]
    }

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
    fun `getAdminRoleUserGroup returns user from repository if found`()
    {
        val existingUser = "username"
        val mockUser = mock<User>()
        whenever(mockUserRepository.findByUsername(existingUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

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
        whenever(mockUserRepository.findByUsername(newUser.username)).doReturn(null)
        whenever(mockUserRepository.save(newUser)).doReturn(newUser)
        val service = BaseUserService(mockUserRepository, mockUserGroupRepository)

        val user = service.saveUserFromGithub(newUser.username, "displayName", "email")

        assertEquals(user.displayName, newUser.displayName)
        verify(mockUserGroupRepository).findByRole(Role.USER)
        verify(mockUserRepository).findByUsername(newUser.username)
        verify(mockUserRepository).save(argThat { this.username == newUser.username })
    }
}
