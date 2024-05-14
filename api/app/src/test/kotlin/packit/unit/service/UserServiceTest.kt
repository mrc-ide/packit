package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.anyList
import org.mockito.Mockito.`when`
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import packit.exceptions.PackitException
import packit.model.Role
import packit.model.User
import packit.model.dto.CreateBasicUser
import packit.model.dto.UpdateUserRoles
import packit.repository.UserRepository
import packit.service.BaseUserService
import packit.service.RoleService
import java.time.Instant
import kotlin.test.assertEquals

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
        on { getUsernameRole(createBasicUser.email) } doReturn Role(createBasicUser.email)
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
    fun `getUserForLogin gets user from repository & updates latest time`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserRepository.save(mockUser)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val user = service.getUserForLogin(mockUser.username)

        assertEquals(user, mockUser)
        verify(mockUserRepository).findByUsername(mockUser.username)
        verify(mockUserRepository).save(argThat { this == mockUser })
    }

    @Test
    fun `getUserForLogin throws exception if user not found`()
    {
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex = assertThrows<PackitException> { service.getUserForLogin(mockUser.username) }

        assertEquals(ex.key, "userNotFound")
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
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        service.createBasicUser(createBasicUser)

        verify(mockRoleService).getRolesByRoleNames(createBasicUser.userRoles)
        verify(mockRoleService).getUsernameRole(createBasicUser.email)
        verify(passwordEncoder).encode(createBasicUser.password)
        verify(mockUserRepository).save(
            argThat {
                this.username == createBasicUser.email
                this.password == "encodedPassword"
                !this.disabled
                this.displayName == createBasicUser.displayName
                this.email == createBasicUser.email
                this.userSource == "basic"
                this.lastLoggedIn == null
                this.roles.map { it.name }.containsAll(testRoles.map { it.name }.plus(createBasicUser.email))
            }
        )
    }

    @Test
    fun `updateUserRoles adds and remove roles from user`()
    {
        val roleToAdd = listOf(Role("NEW_ROLE"))
        val rolesToRemove = listOf(Role("USER"))
        val updateUserRoles = UpdateUserRoles(roleToAdd.map { it.name }, rolesToRemove.map { it.name })
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(roleToAdd + rolesToRemove)
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserRepository.save(any<User>())).thenAnswer { it.getArgument(0) }
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        service.updateUserRoles(mockUser.username, updateUserRoles)

        verify(mockUserRepository).save(
            argThat {
                roles.containsAll(roleToAdd)
                roles.size == 1
            }
        )
    }

    @Test
    fun `updateUserRoles throws exception when adding role that  already exists`()
    {
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(mockUser.roles)
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex =
            assertThrows<PackitException> {
                service.updateUserRoles(
                    mockUser.username,
                    UpdateUserRoles(roleNamesToAdd = mockUser.roles.map { it.name })
                )
            }

        assertEquals(ex.key, "userRoleExists")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateUserRoles throws exception when user not found`()
    {
        `when`(mockUserRepository.findByUsername(any())).doReturn(null)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex = assertThrows<PackitException> { service.updateUserRoles("nonexistent", UpdateUserRoles()) }

        assertEquals(ex.key, "userNotFound")
        assertEquals(ex.httpStatus, HttpStatus.NOT_FOUND)
    }

    @Test
    fun `updateUserRoles throws exception when trying to add username role`()
    {
        val usernameRole = Role(mockUser.username, isUsername = true)
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(listOf(usernameRole))
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex = assertThrows<PackitException> {
            service.updateUserRoles(
                mockUser.username,
                UpdateUserRoles(roleNamesToAdd = listOf(usernameRole.name))
            )
        }

        assertEquals(ex.key, "cannotUpdateUsernameRoles")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateUserRoles throws exception when trying to remove role that does not exist`()
    {
        val nonExistentRole = Role("NON_EXISTENT_ROLE")
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(listOf(nonExistentRole))
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex =
            assertThrows<PackitException> {
                service.updateUserRoles(
                    mockUser.username,
                    UpdateUserRoles(roleNamesToRemove = listOf(nonExistentRole.name))
                )
            }

        assertEquals(ex.key, "userRoleNotExists")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateUserRoles throws exception when trying to remove username role`()
    {
        val usernameRole = Role(mockUser.username, isUsername = true)
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(listOf(usernameRole))
        `when`(mockUserRepository.findByUsername(mockUser.username)).doReturn(mockUser)
        val service = BaseUserService(mockUserRepository, mockRoleService, passwordEncoder)

        val ex = assertThrows<PackitException> {
            service.updateUserRoles(
                mockUser.username,
                UpdateUserRoles(roleNamesToRemove = listOf(usernameRole.name))
            )
        }

        assertEquals(ex.key, "cannotUpdateUsernameRoles")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
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
}
