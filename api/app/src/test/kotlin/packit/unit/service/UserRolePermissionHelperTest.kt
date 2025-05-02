package packit.unit.service

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.kotlin.mock
import packit.model.Packet
import packit.model.Role
import packit.model.RolePermission
import packit.model.User
import packit.security.PermissionChecker
import packit.service.BaseUserRolePermissionHelper
import packit.service.PermissionService
import java.time.Instant

class BaseUserRolePermissionHelperTest
{
    private val now = Instant.now().epochSecond.toDouble()
    private val packet = Packet(
        "20240101-090000-4321gaga",
        "test",
        "",
        mapOf("alpha" to 1),
        now,
        now,
        now
    )
    private val permissionService = mock<PermissionService>()
    private val permissionChecker = mock<PermissionChecker>()
    private val helper = BaseUserRolePermissionHelper(permissionService, permissionChecker)

    @Test
    fun `hasOnlySpecificReadPacketPermission when user has only read permission returns true`()
    {
        // Arrange
        val permissions = listOf(mock<RolePermission>())
        val scopedPermissions = listOf("read:packet:testPacket:1")

        `when`(permissionService.mapToScopedPermission(permissions)).thenReturn(scopedPermissions)
        `when`(
            permissionChecker.hasPacketReadPermissionForPacket(
                scopedPermissions,
                packet.name,
                packet.id
            )
        ).thenReturn(true)
        `when`(permissionChecker.canReadPacketGroup(scopedPermissions, packet.name)).thenReturn(false)
        `when`(permissionChecker.canManagePacket(scopedPermissions, packet.name, packet.id)).thenReturn(false)

        // Act & Assert
        assertTrue(helper.hasOnlySpecificReadPacketPermission(permissions, packet))
    }

    @Test
    fun `hasOnlySpecificReadPacketPermission when user has group read permission returns false`()
    {
        // Arrange
        val permissions = listOf(mock<RolePermission>())
        val scopedPermissions = listOf("read:packetGroup:testPacket")

        `when`(permissionService.mapToScopedPermission(permissions)).thenReturn(scopedPermissions)
        `when`(
            permissionChecker.hasPacketReadPermissionForPacket(
                scopedPermissions,
                packet.name,
                packet.id
            )
        ).thenReturn(true)
        `when`(permissionChecker.canReadPacketGroup(scopedPermissions, packet.name)).thenReturn(true)
        `when`(permissionChecker.canManagePacket(scopedPermissions, packet.name, packet.id)).thenReturn(false)

        // Act & Assert
        assertFalse(helper.hasOnlySpecificReadPacketPermission(permissions, packet))
    }

    @Test
    fun `hasOnlySpecificReadPacketGroupPermission when user has only group read permission returns true`()
    {
        // Arrange
        val permissions = listOf(mock<RolePermission>())
        val packetGroupName = "testPacketGroup"
        val scopedPermissions = listOf("read:packetGroup:testPacketGroup")

        `when`(permissionService.mapToScopedPermission(permissions)).thenReturn(scopedPermissions)
        `when`(permissionChecker.hasPacketReadPermissionForGroup(scopedPermissions, packetGroupName)).thenReturn(true)
        `when`(permissionChecker.canReadAllPackets(scopedPermissions)).thenReturn(false)
        `when`(permissionChecker.canManagePacketGroup(scopedPermissions, packetGroupName)).thenReturn(false)

        // Act & Assert
        assertTrue(helper.hasOnlySpecificReadPacketGroupPermission(permissions, packetGroupName))
    }

    @Test
    fun `hasOnlySpecificReadPacketGroupPermission when user has manage permission returns false`()
    {
        // Arrange
        val permissions = listOf(mock<RolePermission>())
        val packetGroupName = "testPacketGroup"
        val scopedPermissions = listOf("manage:packetGroup:testPacketGroup")

        `when`(permissionService.mapToScopedPermission(permissions)).thenReturn(scopedPermissions)
        `when`(permissionChecker.hasPacketReadPermissionForGroup(scopedPermissions, packetGroupName)).thenReturn(true)
        `when`(permissionChecker.canReadAllPackets(scopedPermissions)).thenReturn(false)
        `when`(permissionChecker.canManagePacketGroup(scopedPermissions, packetGroupName)).thenReturn(true)

        // Act & Assert
        assertFalse(helper.hasOnlySpecificReadPacketGroupPermission(permissions, packetGroupName))
    }

    @Test
    fun `userHasDirectReadPacketGroupReadPermission when user has permission returns true`()
    {
        // Arrange
        val user = mock<User>()
        val packetGroupName = "testPacketGroup"
        val userPermissions = mutableListOf(mock<RolePermission>())
        val scopedPermissions = listOf("read:packetGroup:testPacketGroup")

        `when`(user.getSpecificPermissions()).thenReturn(userPermissions)
        `when`(permissionService.mapToScopedPermission(userPermissions)).thenReturn(scopedPermissions)
        `when`(permissionChecker.canReadPacketGroup(scopedPermissions, packetGroupName)).thenReturn(true)

        // Act & Assert
        assertTrue(helper.userHasDirectReadPacketGroupReadPermission(user, packetGroupName))
    }

    @Test
    fun `userHasDirectPacketReadReadPermission when user has permission returns true`()
    {
        // Arrange
        val user = mock<User>()
        val userPermissions = mutableListOf(mock<RolePermission>())
        val scopedPermissions = listOf("read:packet:testPacket:1")

        `when`(user.getSpecificPermissions()).thenReturn(userPermissions)
        `when`(permissionService.mapToScopedPermission(userPermissions)).thenReturn(scopedPermissions)
        `when`(permissionChecker.canReadPacket(scopedPermissions, packet.name, packet.id)).thenReturn(true)

        // Act & Assert
        assertTrue(helper.userHasDirectPacketReadReadPermission(user, packet))
    }

    @Test
    fun `userHasPacketGroupReadPermissionViaRole when user has role with permission returns true`()
    {
        // Arrange
        val user = mock<User>()
        val roles = listOf(mock<Role>())
        val packetGroupName = "testPacketGroup"
        val rolePermissions = mutableListOf(mock<RolePermission>())
        val scopedPermissions = listOf("read:packetGroup:testPacketGroup")
        val role = mock<Role>()

        `when`(user.roles).thenReturn(mutableListOf(role))
        `when`(role.isUsername).thenReturn(false)
        `when`(role.rolePermissions).thenReturn(rolePermissions)
        `when`(permissionService.mapToScopedPermission(rolePermissions)).thenReturn(scopedPermissions)
        `when`(permissionChecker.canReadPacketGroup(scopedPermissions, packetGroupName)).thenReturn(true)

        // Act & Assert
        assertTrue(helper.userHasPacketGroupReadPermissionViaRole(user, roles, packetGroupName))
    }

    @Test
    fun `userHasPacketGroupReadPermissionViaRole when user has no roles with permission returns false`()
    {
        // Arrange
        val user = mock<User>()
        val roles = listOf<Role>(mock<Role>())
        val packetGroupName = "testPacketGroup"
        val rolePermissions = mutableListOf(mock<RolePermission>())
        val scopedPermissions = listOf("other:permission")
        val role = mock<Role>()

        `when`(user.roles).thenReturn(mutableListOf(role))
        `when`(role.isUsername).thenReturn(false)
        `when`(role.rolePermissions).thenReturn(rolePermissions)
        `when`(permissionService.mapToScopedPermission(rolePermissions)).thenReturn(scopedPermissions)
        `when`(permissionChecker.canReadPacketGroup(scopedPermissions, packetGroupName)).thenReturn(false)

        // Act & Assert
        assertFalse(helper.userHasPacketGroupReadPermissionViaRole(user, roles, packetGroupName))
    }

    @Test
    fun `userHasPacketReadPermissionViaRole when user has role with permission returns true`()
    {
        // Arrange
        val user = mock<User>()
        val roles = listOf(mock<Role>())
        val rolePermissions = mutableListOf(mock<RolePermission>())
        val scopedPermissions = listOf("read:packet:testPacket:1")
        val role = mock<Role>()

        `when`(user.roles).thenReturn(mutableListOf(role))
        `when`(role.isUsername).thenReturn(false)
        `when`(role.rolePermissions).thenReturn(rolePermissions)
        `when`(permissionService.mapToScopedPermission(rolePermissions)).thenReturn(scopedPermissions)
        `when`(permissionChecker.canReadPacket(scopedPermissions, packet.name, packet.id)).thenReturn(true)

        // Act & Assert
        assertTrue(helper.userHasPacketReadPermissionViaRole(user, roles, packet))
    }

    @Test
    fun `userHasPacketReadPermissionViaRole when all roles are username returns false`()
    {
        // Arrange
        val user = mock<User>()
        val roles = listOf(mock<Role>())
        val role = mock<Role>()

        `when`(user.roles).thenReturn(mutableListOf(role))
        `when`(role.isUsername).thenReturn(true)

        // Act & Assert
        assertFalse(helper.userHasPacketReadPermissionViaRole(user, roles, packet))
    }
}