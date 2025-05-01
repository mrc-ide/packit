package packit.service

import org.springframework.stereotype.Service
import packit.model.Packet
import packit.model.Role
import packit.model.RolePermission
import packit.model.User
import packit.security.PermissionChecker

interface UserRolePermissionHelper
{
    fun hasOnlySpecificReadPacketPermission(permissions: List<RolePermission>, packet: Packet): Boolean
    fun hasOnlySpecificReadPacketGroupPermission(permissions: List<RolePermission>, packetGroupName: String): Boolean
    fun userHasDirectReadPacketGroupReadPermission(user: User, packetGroupName: String): Boolean
    fun userHasDirectPacketReadReadPermission(user: User, packet: Packet): Boolean
    fun userHasPacketGroupReadPermissionViaRole(user: User, roles: List<Role>, packetGroupName: String): Boolean
    fun userHasPacketReadPermissionViaRole(user: User, roles: List<Role>, packet: Packet): Boolean
}

@Service
class BaseUserRolePermissionHelper(
    private val permissionService: PermissionService,
    private val permissionChecker: PermissionChecker
) : UserRolePermissionHelper
{
    override fun hasOnlySpecificReadPacketPermission(permissions: List<RolePermission>, packet: Packet): Boolean
    {
        val permissionNames = permissionService.mapToScopedPermission(permissions)
        return permissionChecker.hasPacketReadPermissionForPacket(permissionNames, packet.name, packet.id) &&
                !permissionChecker.canManagePacket(permissionNames, packet.name, packet.id) &&
                !permissionChecker.canReadAllPackets(permissionNames)
    }

    override fun hasOnlySpecificReadPacketGroupPermission(
        permissions: List<RolePermission>,
        packetGroupName: String
    ): Boolean
    {
        val permissionNames = permissionService.mapToScopedPermission(permissions)
        return permissionChecker.hasPacketReadPermissionForGroup(permissionNames, packetGroupName) &&
                !permissionChecker.canManagePacketGroup(permissionNames, packetGroupName) &&
                !permissionChecker.canReadAllPackets(permissionNames)
    }

    override fun userHasDirectReadPacketGroupReadPermission(user: User, packetGroupName: String): Boolean =
        permissionChecker.canReadPacketGroup(
            permissionService.mapToScopedPermission(user.getSpecificPermissions()),
            packetGroupName
        )

    override fun userHasDirectPacketReadReadPermission(user: User, packet: Packet): Boolean =
        permissionChecker.canReadPacket(
            permissionService.mapToScopedPermission(user.getSpecificPermissions()),
            packet.name,
            packet.id
        )

    override fun userHasPacketGroupReadPermissionViaRole(
        user: User,
        roles: List<Role>,
        packetGroupName: String
    ): Boolean =
        user.roles.filterNot { it.isUsername }.any {
            permissionChecker.canReadPacketGroup(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packetGroupName
            )
        }

    override fun userHasPacketReadPermissionViaRole(
        user: User,
        roles: List<Role>,
        packet: Packet
    ): Boolean =
        user.roles.filterNot { it.isUsername }.any {
            permissionChecker.canReadPacket(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packet.name,
                packet.id
            )
        }
}
