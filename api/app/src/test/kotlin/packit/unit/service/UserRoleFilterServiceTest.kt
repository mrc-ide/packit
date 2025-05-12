package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import packit.model.Packet
import packit.model.Role
import packit.model.RolePermission
import packit.model.User
import packit.model.dto.RolesAndUsers
import packit.security.PermissionChecker
import packit.service.BaseUserRoleFilterService
import packit.service.PermissionService
import packit.service.UserRolePermissionHelper
import kotlin.test.assertEquals

class UserRoleFilterServiceTest
{

    private val rolePermissions = mutableListOf(mock<RolePermission>())
    private val mockRole = Role("roleName", rolePermissions = rolePermissions)

    private val userRolePermissions = mutableListOf(mock<RolePermission>())
    private val userRole = Role(name = "username", isUsername = true, rolePermissions = userRolePermissions)
    private val mockUser = User(
        username = "username",
        displayName = "displayName",
        disabled = false,
        userSource = "basic",
        roles = mutableListOf(userRole),
    )
    private val rolesAndUsers = RolesAndUsers(
        roles = listOf(mockRole),
        users = listOf(mockUser)
    )
    private val packetGroupName = "testPacketGroup"
    private val authorities = listOf("packet.read")

    private val permissionService = mock<PermissionService> {
        on { mapToScopedPermission(any()) }.thenReturn(authorities)
    }
    private val permissionChecker = mock<PermissionChecker>()
    private val permissionHelper = mock<UserRolePermissionHelper>()
    private val userRoleFilterService = BaseUserRoleFilterService(
        permissionService,
        permissionChecker,
        permissionHelper
    )

    @Test
    fun `getRolesAndUsersWithSpecificReadPacketGroupPermission returns correct filtered list`()
    {
        whenever(permissionHelper.hasOnlySpecificReadPacketGroupPermission(any(), any())).thenReturn(true)

        val result =
            userRoleFilterService.getRolesAndUsersWithSpecificReadPacketGroupPermission(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packetGroupName
            )

        assertEquals(result, rolesAndUsers)
        verify(permissionHelper).hasOnlySpecificReadPacketGroupPermission(rolePermissions, packetGroupName)
        verify(permissionHelper).hasOnlySpecificReadPacketGroupPermission(userRolePermissions, packetGroupName)
    }

    @Test
    fun `getRolesAndUsersWithSpecificReadPacketPermission returns correct filtered list`()
    {
        whenever(permissionHelper.hasOnlySpecificReadPacketPermission(any(), any())).thenReturn(true)
        val packet = mock<Packet>()
        val result =
            userRoleFilterService.getRolesAndUsersWithSpecificReadPacketPermission(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packet
            )

        assertEquals(result, rolesAndUsers)
        verify(permissionHelper).hasOnlySpecificReadPacketPermission(rolePermissions, packet)
        verify(permissionHelper).hasOnlySpecificReadPacketPermission(userRolePermissions, packet)
    }

    @Test
    fun `getRolesAndUsersCantPacketReadGroup returns all roles and users`()
    {
        whenever(permissionChecker.canReadPacketGroup(authorities, packetGroupName)).thenReturn(false)
        whenever(permissionHelper.userHasDirectReadPacketGroupReadPermission(any(), any())).thenReturn(false)
        whenever(permissionHelper.userHasPacketGroupReadPermissionViaRole(any(), any(), any())).thenReturn(false)

        val result =
            userRoleFilterService.getRolesAndUsersCantReadPacketReadGroup(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packetGroupName
            )

        assertEquals(result, rolesAndUsers)
        verify(permissionService).mapToScopedPermission(rolePermissions)
        verify(permissionChecker).canReadPacketGroup(authorities, packetGroupName)
        verify(permissionHelper).userHasDirectReadPacketGroupReadPermission(mockUser, packetGroupName)
        verify(permissionHelper).userHasPacketGroupReadPermissionViaRole(mockUser, rolesAndUsers.roles, packetGroupName)
    }

    @Test
    fun `getRolesAndUsersCantPacketReadGroup returns empty list when all roles and users can read`()
    {
        whenever(permissionChecker.canReadPacketGroup(authorities, packetGroupName)).thenReturn(true)
        whenever(permissionHelper.userHasDirectReadPacketGroupReadPermission(any(), any())).thenReturn(true)
        whenever(permissionHelper.userHasPacketGroupReadPermissionViaRole(any(), any(), any())).thenReturn(true)

        val result =
            userRoleFilterService.getRolesAndUsersCantReadPacketReadGroup(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packetGroupName
            )

        assertEquals(result, RolesAndUsers(emptyList(), emptyList()))
    }

    @Test
    fun `getRolesAndUsersCantPacketReadGroup returns empty user list when can read via user role`()
    {
        whenever(permissionChecker.canReadPacketGroup(authorities, packetGroupName)).thenReturn(false)
        whenever(permissionHelper.userHasDirectReadPacketGroupReadPermission(any(), any())).thenReturn(true)
        whenever(permissionHelper.userHasPacketGroupReadPermissionViaRole(any(), any(), any())).thenReturn(false)

        val result =
            userRoleFilterService.getRolesAndUsersCantReadPacketReadGroup(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packetGroupName
            )

        assertEquals(result, RolesAndUsers(rolesAndUsers.roles, emptyList()))
    }

    @Test
    fun `getRolesAndUsersCantReadPacket returns all roles and users`()
    {
        val packet = mock<Packet>()
        whenever(permissionChecker.canReadPacket(authorities, packet.name, packet.id)).thenReturn(false)
        whenever(permissionHelper.userHasDirectPacketReadReadPermission(any(), any())).thenReturn(false)
        whenever(permissionHelper.userHasPacketReadPermissionViaRole(any(), any(), any())).thenReturn(false)

        val result =
            userRoleFilterService.getRolesAndUsersCantReadPacket(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packet
            )

        assertEquals(result, rolesAndUsers)
        verify(permissionService).mapToScopedPermission(rolePermissions)
        verify(permissionChecker).canReadPacket(authorities, packet.name, packet.id)
        verify(permissionHelper).userHasDirectPacketReadReadPermission(mockUser, packet)
        verify(permissionHelper).userHasPacketReadPermissionViaRole(mockUser, rolesAndUsers.roles, packet)
    }

    @Test
    fun `getRolesAndUsersCantReadPacket returns empty list when all roles and users can read`()
    {
        val packet = mock<Packet>()
        whenever(permissionChecker.canReadPacket(authorities, packet.name, packet.id)).thenReturn(true)
        whenever(permissionHelper.userHasDirectPacketReadReadPermission(any(), any())).thenReturn(true)
        whenever(permissionHelper.userHasPacketReadPermissionViaRole(any(), any(), any())).thenReturn(true)

        val result =
            userRoleFilterService.getRolesAndUsersCantReadPacket(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packet
            )

        assertEquals(result, RolesAndUsers(emptyList(), emptyList()))
    }

    @Test
    fun `getRolesAndUsersCantReadPacket returns empty user list when can read via user role`()
    {
        val packet = mock<Packet>()
        whenever(permissionChecker.canReadPacket(authorities, packet.name, packet.id)).thenReturn(false)
        whenever(permissionHelper.userHasDirectPacketReadReadPermission(any(), any())).thenReturn(true)
        whenever(permissionHelper.userHasPacketReadPermissionViaRole(any(), any(), any())).thenReturn(false)

        val result =
            userRoleFilterService.getRolesAndUsersCantReadPacket(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packet
            )

        assertEquals(result, RolesAndUsers(rolesAndUsers.roles, emptyList()))
    }

    @Test
    fun `getRolesAndSpecificUsersCanReadPacket correctly filters list`()
    {
        val packet = mock<Packet>()
        whenever(permissionChecker.canReadPacket(authorities, packet.name, packet.id)).thenReturn(true)
        whenever(permissionHelper.userHasDirectPacketReadReadPermission(any(), any())).thenReturn(true)
        whenever(permissionHelper.userHasPacketReadPermissionViaRole(any(), any(), any())).thenReturn(false)

        val result =
            userRoleFilterService.getRolesAndSpecificUsersCanReadPacket(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packet
            )

        assertEquals(result, RolesAndUsers(rolesAndUsers.roles, listOf(mockUser)))
        verify(permissionService).mapToScopedPermission(rolePermissions)
        verify(permissionService).mapToScopedPermission(userRolePermissions)
        verify(permissionChecker, times(2)).canReadPacket(authorities, packet.name, packet.id)
    }

    @Test
    fun `getRolesAndSpecificUsersCanReadPacketGroup correctly filters list`()
    {
        whenever(permissionChecker.canReadPacketGroup(authorities, packetGroupName)).thenReturn(true)
        whenever(permissionHelper.userHasDirectReadPacketGroupReadPermission(any(), any())).thenReturn(true)
        whenever(permissionHelper.userHasPacketGroupReadPermissionViaRole(any(), any(), any())).thenReturn(false)

        val result =
            userRoleFilterService.getRolesAndSpecificUsersCanReadPacketGroup(
                rolesAndUsers.roles,
                rolesAndUsers.users,
                packetGroupName
            )

        assertEquals(result, RolesAndUsers(rolesAndUsers.roles, listOf(mockUser)))
        verify(permissionService).mapToScopedPermission(rolePermissions)
        verify(permissionService).mapToScopedPermission(userRolePermissions)
        verify(permissionChecker, times(2)).canReadPacketGroup(authorities, packetGroupName)
    }
}
