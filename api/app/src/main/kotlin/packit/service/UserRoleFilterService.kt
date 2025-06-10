package packit.service

import org.springframework.stereotype.Service
import packit.model.Packet
import packit.model.Role
import packit.model.User
import packit.model.dto.RolesAndUsers
import packit.security.PermissionChecker

interface UserRoleFilterService {
    fun getRolesAndUsersWithSpecificReadPacketGroupPermission(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers

    fun getRolesAndUsersWithSpecificReadPacketPermission(
        roles: List<Role>,
        users: List<User>,
        packet: Packet
    ): RolesAndUsers

    fun getRolesAndUsersCannotReadPacketReadGroup(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers

    fun getRolesAndUsersCannotReadPacket(
        roles: List<Role>,
        users: List<User>,
        packet: Packet
    ): RolesAndUsers

    fun getRolesAndSpecificUsersCanReadPacket(
        roles: List<Role>,
        users: List<User>,
        packet: Packet
    ): RolesAndUsers

    fun getRolesAndSpecificUsersCanReadPacketGroup(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers
}

@Service
class BaseUserRoleFilterService(
    private val permissionService: PermissionService,
    private val permissionChecker: PermissionChecker,
    private val permissionHelper: UserRolePermissionHelper
) : UserRoleFilterService {
    override fun getRolesAndUsersWithSpecificReadPacketGroupPermission(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers {
        val rolesWithRead =
            roles.filter {
                permissionHelper.hasOnlySpecificReadPacketGroupPermission(
                    it.rolePermissions,
                    packetGroupName
                )
            }
        val usersWithRead =
            users.filter { user ->
                permissionHelper.hasOnlySpecificReadPacketGroupPermission(
                    user.getSpecificPermissions(),
                    packetGroupName
                )
            }

        return RolesAndUsers(rolesWithRead, usersWithRead)
    }

    override fun getRolesAndUsersWithSpecificReadPacketPermission(
        roles: List<Role>,
        users: List<User>,
        packet: Packet
    ): RolesAndUsers {
        val rolesWithRead = roles.filter {
            permissionHelper.hasOnlySpecificReadPacketPermission(it.rolePermissions, packet)
        }
        val usersWithRead = users.filter { user ->
            permissionHelper.hasOnlySpecificReadPacketPermission(user.getSpecificPermissions(), packet)
        }
        return RolesAndUsers(rolesWithRead, usersWithRead)
    }

    override fun getRolesAndUsersCannotReadPacketReadGroup(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers {
        val rolesCannotRead = roles.filterNot {
            permissionChecker.canReadPacketGroup(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packetGroupName
            )
        }

        val usersCannotRead = users.filter { user ->
            !permissionHelper.userHasDirectReadPacketGroupReadPermission(user, packetGroupName) &&
                !permissionHelper.userHasPacketGroupReadPermissionViaRole(user, roles, packetGroupName)
        }

        return RolesAndUsers(rolesCannotRead, usersCannotRead)
    }

    override fun getRolesAndUsersCannotReadPacket(
        roles: List<Role>,
        users: List<User>,
        packet: Packet
    ): RolesAndUsers {
        val rolesCannotRead = roles.filterNot {
            permissionChecker.canReadPacket(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packet.name,
                packet.id
            )
        }
        val usersCannotRead = users.filter { user ->
            !permissionHelper.userHasDirectPacketReadReadPermission(user, packet) &&
                !permissionHelper.userHasPacketReadPermissionViaRole(user, roles, packet)
        }

        return RolesAndUsers(rolesCannotRead, usersCannotRead)
    }

    override fun getRolesAndSpecificUsersCanReadPacket(
        roles: List<Role>,
        users: List<User>,
        packet: Packet
    ): RolesAndUsers {
        val rolesCanRead = roles.filter {
            permissionChecker.canReadPacket(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packet.name,
                packet.id
            )
        }
        val specificUsersCanRead = users.filter {
            permissionChecker.canReadPacket(
                permissionService.mapToScopedPermission(it.getSpecificPermissions()),
                packet.name,
                packet.id
            )
        }
        return RolesAndUsers(rolesCanRead, specificUsersCanRead)
    }

    override fun getRolesAndSpecificUsersCanReadPacketGroup(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers {
        val rolesCanRead = roles.filter {
            permissionChecker.canReadPacketGroup(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packetGroupName
            )
        }
        val specificUsersCanRead = users.filter {
            permissionChecker.canReadPacketGroup(
                permissionService.mapToScopedPermission(it.getSpecificPermissions()),
                packetGroupName
            )
        }

        return RolesAndUsers(rolesCanRead, specificUsersCanRead)
    }
}
