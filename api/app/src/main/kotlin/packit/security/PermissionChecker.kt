package packit.security

import org.springframework.stereotype.Component
import packit.service.PermissionService


@Component
class PermissionChecker(private val permissionService: PermissionService)
{
    /** Global Permissions */
    fun hasUserManagePermission(authorities: List<String> = emptyList()): Boolean =
        authorities.contains("user.manage")

    fun hasGlobalPacketManagePermission(authorities: List<String> = emptyList()): Boolean =
        authorities.contains("packet.manage")

    fun hasGlobalReadPermission(authorities: List<String> = emptyList()): Boolean =
        authorities.contains("packet.read")

    /** Manage packets */
    fun canManageAllPackets(authorities: List<String> = emptyList()): Boolean =
        hasUserManagePermission(authorities) || hasGlobalPacketManagePermission(authorities)

    fun hasPacketManagePermissionForGroup(
        authorities: List<String> = emptyList(),
        packetGroupName: String
    ): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.manage", packetGroupName))

    fun canManagePacketGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean =
        canManageAllPackets(authorities) || hasPacketManagePermissionForGroup(authorities, packetGroupName)

    fun hasPacketManagePermissionForPacket(
        authorities: List<String> = emptyList(),
        packetGroupName: String,
        packetId: String
    ): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.manage", packetGroupName, packetId))

    fun canManagePacket(
        authorities: List<String> = emptyList(),
        packetGroupName: String,
        packetId: String
    ): Boolean =
        canManagePacketGroup(authorities, packetGroupName) ||
                hasPacketManagePermissionForPacket(authorities, packetGroupName, packetId)

    /** Read packets */
    fun canReadAllPackets(authorities: List<String> = emptyList()): Boolean =
        canManageAllPackets(authorities) || hasGlobalReadPermission(authorities)

    fun hasPacketReadPermissionForGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.read", packetGroupName))

    fun canReadPacketGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean =
        canReadAllPackets(authorities) ||
                canManagePacketGroup(authorities, packetGroupName) ||
                hasPacketReadPermissionForGroup(authorities, packetGroupName)

    fun canManageAnyPacketInGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean =
        authorities.any {
            it.startsWith("packet.manage:packet:$packetGroupName")
        }

    fun canReadAnyPacketInGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean =
        authorities.any {
            it.startsWith("packet.read:packet:$packetGroupName") ||
                    canManageAnyPacketInGroup(authorities, packetGroupName)
        }

    fun hasAnyPacketManagePermission(authorities: List<String> = emptyList()): Boolean =
        authorities.any {
            it.startsWith("packet.manage")
        }

    fun hasPacketReadPermissionForPacket(
        authorities: List<String> = emptyList(),
        packetGroupName: String,
        packetId: String
    ): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.read", packetGroupName, packetId))

    fun canReadPacket(
        authorities: List<String> = emptyList(),
        packetGroup: String,
        packetId: String
    ): Boolean =
        canReadPacketGroup(authorities, packetGroup) ||
                canManagePacket(authorities, packetGroup, packetId) ||
                hasPacketReadPermissionForPacket(authorities, packetGroup, packetId)
}