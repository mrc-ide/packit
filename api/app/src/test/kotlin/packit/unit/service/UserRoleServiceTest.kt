package packit.unit.service

import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.anyList
import org.mockito.Mockito.`when`
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.*
import packit.service.BaseUserRoleService
import packit.service.RoleService
import packit.service.UserRoleFilterService
import packit.service.UserService
import java.time.Instant
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class UserRoleServiceTest {
    private val adminRole = Role("ADMIN", id = 10)
    private val testRoles = listOf(Role("USER", id = 11), adminRole)
    private val mockUserService = mock<UserService>()
    private val mockUser = User(
        username = "username",
        displayName = "displayName",
        disabled = false,
        email = "email",
        userSource = "github",
        lastLoggedIn = Instant.parse("2018-12-12T00:00:00Z"),
        roles = testRoles.toMutableList(),
        id = UUID.randomUUID()
    )
    private val mockServiceUser = User(
        username = "SERVICE",
        displayName = "Service Account",
        disabled = false,
        email = "email",
        userSource = "service",
        lastLoggedIn = Instant.parse("2018-12-12T00:00:00Z"),
        roles = testRoles.toMutableList(),
        id = UUID.randomUUID()
    )
    private val mockRole = Role("role1", users = mutableListOf(mockUser), id = 1)
    private val mockRoleService = mock<RoleService>()
    private val userRoleFilterService = mock<UserRoleFilterService>()
    private val service = BaseUserRoleService(mockRoleService, mockUserService, userRoleFilterService)

    @Test
    fun `updateUserRoles adds and remove roles from user`() {
        val roleToAdd = Role("NEW_ROLE")
        val roleToRemove = Role("USER")
        val updateUserRoles = UpdateUserRoles(listOf(roleToAdd.name), listOf(roleToRemove.name))
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(listOf(roleToAdd, roleToRemove))
        `when`(mockUserService.getByUsername(mockUser.username)).doReturn(mockUser)
        `when`(mockUserService.saveUser(any<User>())).thenAnswer { it.getArgument(0) }

        val result = service.updateUserRoles(mockUser.username, updateUserRoles)

        verify(mockUserService).saveUser(
            argThat {
                assertEquals(listOf(adminRole, roleToAdd), this.roles)
                true
            }
        )
        assertEquals(listOf(adminRole, roleToAdd), result.roles)
        assertEquals(mockUser.username, result.username)
    }

    @Test
    fun `updateUserRoles throws exception when adding role that  already exists`() {
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(mockUser.roles)
        `when`(mockUserService.getByUsername(mockUser.username)).doReturn(mockUser)

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
    fun `updateUserRoles throws exception when user not found`() {
        `when`(mockUserService.getByUsername(mockUser.username)).doReturn(null)

        val ex = assertThrows<PackitException> { service.updateUserRoles("nonexistent", UpdateUserRoles()) }

        assertEquals(ex.key, "userNotFound")
        assertEquals(ex.httpStatus, HttpStatus.NOT_FOUND)
    }

    @Test
    fun `updateUserRoles throws exception when trying to add username role`() {
        val usernameRole = Role(mockUser.username, isUsername = true)
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(listOf(usernameRole))
        `when`(mockUserService.getByUsername(mockUser.username)).doReturn(mockUser)

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
    fun `updateUserRoles throws exception when trying to remove role that does not exist`() {
        val nonExistentRole = Role("NON_EXISTENT_ROLE")
        `when`(mockRoleService.getRolesByRoleNames(anyList())).doReturn(listOf(nonExistentRole))
        `when`(mockUserService.getByUsername(mockUser.username)).doReturn(mockUser)

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
    fun `updateRoleUsers adds and remove users from role`() {
        val userToDelete = mockUser
        val userToAdd = User(
            "username2",
            disabled = false,
            displayName = "testUser2",
            userSource = "github",
            id = UUID.randomUUID()
        )

        mockUser.roles.add(mockRole)
        val updateRoleUsers = UpdateRoleUsers(listOf(userToAdd.username), listOf(userToDelete.username))
        `when`(mockRoleService.getByRoleName(mockRole.name)).doReturn(mockRole)
        `when`(mockUserService.getUsersByUsernames(anyList())).doReturn(listOf(userToAdd, userToDelete))
        `when`(mockUserService.saveUsers(anyList())).thenAnswer { it.getArgument(0) }

        val result = service.updateRoleUsers(mockRole.name, updateRoleUsers)

        verify(mockUserService).saveUsers(
            argThat {
                assertEquals(this.size, 2)
                assertEquals(this.get(0).username, userToAdd.username)
                assertTrue(this.get(0).roles.contains(mockRole))
                assertEquals(this.get(1).username, userToDelete.username)
                assertFalse(this.get(1).roles.contains(mockRole))
                true
            }
        )
        assertEquals(1, result.users.size)
        assertEquals(userToAdd.username, result.users.first().username)
    }

    @Test
    fun `updateRoleUsers throws exception when role not found`() {
        `when`(mockRoleService.getByRoleName(mockRole.name)).doReturn(null)

        val ex = assertThrows<PackitException> { service.updateRoleUsers(mockRole.name, UpdateRoleUsers()) }

        assertEquals(ex.key, "roleNotFound")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateRoleUsers throws exception when trying to update username role`() {
        val usernameRole = Role(mockUser.username, isUsername = true)
        `when`(mockRoleService.getByRoleName(usernameRole.name)).doReturn(usernameRole)

        val ex = assertThrows<PackitException> {
            service.updateRoleUsers(usernameRole.name, UpdateRoleUsers())
        }

        assertEquals(ex.key, "cannotUpdateUsernameRoles")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateRoleUsers throws exception when adding user is already part of role`() {
        val usersToDelete = listOf(mockUser)
        val usersToAdd = listOf(mockUser)
        mockUser.roles.add(mockRole)
        val updateRoleUsers = UpdateRoleUsers(usersToAdd.map { it.username }, usersToDelete.map { it.username })
        `when`(mockRoleService.getByRoleName(mockRole.name)).doReturn(mockRole)
        `when`(mockUserService.getUsersByUsernames(anyList())).doReturn(usersToAdd + usersToDelete)

        val ex = assertThrows<PackitException> { service.updateRoleUsers(mockRole.name, updateRoleUsers) }

        assertEquals(ex.key, "userRoleExists")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateRoleUsers throws exception when removing user that is not part of role`() {
        val usersToDelete = listOf(mockUser)
        val updateRoleUsers = UpdateRoleUsers(usernamesToRemove = usersToDelete.map { it.username })
        `when`(mockRoleService.getByRoleName(mockRole.name)).doReturn(mockRole)
        `when`(mockUserService.getUsersByUsernames(anyList())).doReturn(usersToDelete)

        val ex = assertThrows<PackitException> { service.updateRoleUsers(mockRole.name, updateRoleUsers) }

        assertEquals(ex.key, "userRoleNotExists")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateRoleUsers throws exception when adding service account to roles`() {
        whenever(mockRoleService.getByRoleName(mockRole.name)).doReturn(mockRole)
        whenever(mockUserService.getUsersByUsernames(listOf(mockServiceUser.username)))
            .doReturn(listOf(mockServiceUser))

        val ex = assertThrows<PackitException> {
            service.updateRoleUsers(mockRole.name, UpdateRoleUsers(usernamesToAdd = listOf(mockServiceUser.username)))
        }

        assertEquals(ex.key, "cannotModifyServiceUser")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `updateUserRoles throws exception when adding roles to service account`() {
        whenever(mockUserService.getByUsername(mockServiceUser.username)).doReturn(mockServiceUser)
        whenever(mockRoleService.getRolesByRoleNames(listOf(mockRole.name))).doReturn(listOf(mockRole))

        val ex = assertThrows<PackitException> {
            service.updateUserRoles(
                mockServiceUser.username,
                UpdateUserRoles(roleNamesToAdd = listOf(mockRole.name))
            )
        }

        assertEquals(ex.key, "cannotModifyServiceUser")
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `getNonUsernameRolesAndNonServiceUsers returns correct roles and users`() {
        `when`(mockRoleService.getAllRoles(false)).thenReturn(testRoles)
        `when`(mockUserService.getAllNonServiceUsers()).thenReturn(listOf(mockUser))

        val result = service.getNonUsernameRolesAndNonServiceUsers()

        assertEquals(testRoles, result.roles)
        assertEquals(listOf(mockUser), result.users)
        verify(mockRoleService).getAllRoles(false)
        verify(mockUserService).getAllNonServiceUsers()
    }

    @Test
    fun `createSortedRolesAndUsersWithPermissionsDto returns correct dto`() {
        val rolesAndUsers = RolesAndUsers(
            roles = listOf(mockRole),
            users = listOf(mockUser)
        )
        val expectedDto = RolesAndUsersWithPermissionsDto(
            rolesAndUsers.roles.map { it.toDto() },
            rolesAndUsers.users.map { it.toUserWithPermissions() }
        )
        `when`(mockRoleService.getSortedRoles(rolesAndUsers.roles)).thenReturn(rolesAndUsers.roles)
        `when`(mockUserService.getSortedUsers(rolesAndUsers.users)).thenReturn(rolesAndUsers.users)

        val result = service.createSortedRolesAndUsersWithPermissionsDto(rolesAndUsers)

        assertEquals(expectedDto, result)
        verify(mockRoleService).getSortedRoles(rolesAndUsers.roles)
        verify(mockUserService).getSortedUsers(rolesAndUsers.users)
    }

    @Test
    fun `getAllRolesAndUsersWithPermissions returns calls of internal functions`() {
        val expected = RolesAndUsersWithPermissionsDto(
            roles = listOf(mockRole.toDto()),
            users = listOf(mockUser.toUserWithPermissions())
        )
        val serviceSpy = spy(service)
        doReturn(expected).`when`(serviceSpy).getAllRolesAndUsersWithPermissions()
        doReturn(expected).`when`(serviceSpy).createSortedRolesAndUsersWithPermissionsDto(any())

        val result = serviceSpy.getAllRolesAndUsersWithPermissions()

        assertEquals(expected, result)
    }

    @Test
    fun `getRolesAndUsersForPacketGroupReadUpdate returns correct dto`() {
        val rolesAndUsers = RolesAndUsers(
            roles = listOf(mockRole),
            users = listOf(mockUser)
        )
        val rolesAndUsersDtos = BasicRolesAndUsersDto(
            roles = listOf(mockRole.toBasicRoleWithUsersDto()),
            users = listOf(mockUser.toBasicDto())
        )
        val packetGroupNames = listOf("packetGroup1", "packetGroup2")
        val serviceSpy = spy(service)
        `when`(userRoleFilterService.getRolesAndSpecificUsersCanReadPacketGroup(any(), any(), any())).thenReturn(
            rolesAndUsers
        )
        `when`(userRoleFilterService.getRolesAndUsersCantReadPacketReadGroup(any(), any(), any())).thenReturn(
            rolesAndUsers
        )
        `when`(
            userRoleFilterService.getRolesAndUsersWithSpecificReadPacketGroupPermission(
                any(),
                any(),
                any()
            )
        ).thenReturn(rolesAndUsers)
        doReturn(rolesAndUsers).`when`(serviceSpy).getNonUsernameRolesAndNonServiceUsers()
        doReturn(rolesAndUsersDtos).`when`(serviceSpy).createSortedBasicRolesAndUsers(any())

        val result = serviceSpy.getRolesAndUsersForPacketGroupReadUpdate(packetGroupNames)

        assertEquals(packetGroupNames, result.keys.toList())
        packetGroupNames.forEach {
            assert(result[it] is RolesAndUsersForReadUpdate)
            verify(userRoleFilterService).getRolesAndUsersCantReadPacketReadGroup(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                it
            )
            verify(userRoleFilterService).getRolesAndUsersWithSpecificReadPacketGroupPermission(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                it
            )
        }
    }

    @Test
    fun `getRolesAndUsersForPacketReadUpdate returns correct DTO`() {
        val rolesAndUsers = RolesAndUsers(
            roles = listOf(mockRole),
            users = listOf(mockUser)
        )
        val rolesAndUsersDtos = BasicRolesAndUsersDto(
            roles = listOf(mockRole.toBasicRoleWithUsersDto()),
            users = listOf(mockUser.toBasicDto())
        )
        val packet = mock<Packet>()
        val serviceSpy = spy(service)
        `when`(userRoleFilterService.getRolesAndSpecificUsersCanReadPacket(any(), any(), any())).thenReturn(
            rolesAndUsers
        )
        `when`(
            userRoleFilterService.getRolesAndUsersCantReadPacket(
                any(),
                any(),
                any()
            )
        ).thenReturn(rolesAndUsers)
        `when`(
            userRoleFilterService.getRolesAndUsersWithSpecificReadPacketPermission(
                any(),
                any(),
                any()
            )
        ).thenReturn(rolesAndUsers)
        doReturn(rolesAndUsers).`when`(serviceSpy).getNonUsernameRolesAndNonServiceUsers()
        doReturn(rolesAndUsersDtos).`when`(serviceSpy).createSortedBasicRolesAndUsers(any())

        val result = serviceSpy.getRolesAndUsersForPacketReadUpdate(packet)

        assert(result is RolesAndUsersForReadUpdate)
        assertEquals(rolesAndUsersDtos, result.canRead)
        assertEquals(rolesAndUsersDtos, result.withRead)
        assertEquals(rolesAndUsersDtos, result.cantRead)
        verify(userRoleFilterService).getRolesAndSpecificUsersCanReadPacket(
            rolesAndUsers.roles,
            rolesAndUsers.users,
            packet
        )
        verify(userRoleFilterService).getRolesAndUsersCantReadPacket(
            rolesAndUsers.roles,
            rolesAndUsers.users,
            packet
        )
        verify(userRoleFilterService).getRolesAndUsersWithSpecificReadPacketPermission(
            rolesAndUsers.roles,
            rolesAndUsers.users,
            packet
        )
    }

    @Test
    fun `createSortedBasicRolesAndUsers correctly returns sorted dto`() {
        val rolesAndUsers = RolesAndUsers(
            roles = listOf(mockRole),
            users = listOf(mockUser)
        )
        val expectedDto = BasicRolesAndUsersDto(
            roles = rolesAndUsers.roles.map { it.toBasicRoleWithUsersDto() },
            users = rolesAndUsers.users.map { it.toBasicDto() }
        )
        `when`(mockRoleService.getSortedRoles(rolesAndUsers.roles)).thenReturn(rolesAndUsers.roles)
        `when`(mockUserService.getSortedUsers(rolesAndUsers.users)).thenReturn(rolesAndUsers.users)

        val result = service.createSortedBasicRolesAndUsers(rolesAndUsers)

        assertEquals(expectedDto, result)
        verify(mockRoleService).getSortedRoles(rolesAndUsers.roles)
        verify(mockUserService).getSortedUsers(rolesAndUsers.users)
    }
}
