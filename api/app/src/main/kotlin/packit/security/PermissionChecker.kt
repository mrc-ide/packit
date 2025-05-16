package packit.security

import org.springframework.stereotype.Service
import packit.service.PermissionService

interface PermissionChecker {
    /** Global Permissions */
    fun hasUserManagePermission(authorities: List<String> = emptyList()): Boolean
    fun hasGlobalPacketManagePermission(authorities: List<String> = emptyList()): Boolean
    fun hasGlobalReadPermission(authorities: List<String> = emptyList()): Boolean

    /** Manage packets */
    fun canManageAllPackets(authorities: List<String> = emptyList()): Boolean
    fun hasPacketManagePermissionForGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean
    fun canManagePacketGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean
    fun hasPacketManagePermissionForPacket(
        authorities: List<String> = emptyList(),
        packetGroupName: String,
        packetId: String
    ): Boolean

    fun canManagePacket(authorities: List<String> = emptyList(), packetGroupName: String, packetId: String): Boolean

    /** Read packets */
    fun canReadAllPackets(authorities: List<String> = emptyList()): Boolean
    fun hasPacketReadPermissionForGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean
    fun canReadPacketGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean
    fun canManageAnyPacketInGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean
    fun canReadAnyPacketInGroup(authorities: List<String> = emptyList(), packetGroupName: String): Boolean
    fun hasAnyPacketManagePermission(authorities: List<String> = emptyList()): Boolean
    fun hasPacketReadPermissionForPacket(
        authorities: List<String> = emptyList(),
        packetGroupName: String,
        packetId: String
    ): Boolean

    fun canReadPacket(authorities: List<String> = emptyList(), packetGroup: String, packetId: String): Boolean
}

@Service
class BasePermissionChecker(private val permissionService: PermissionService) : PermissionChecker {
    /** Global Permissions */
    override fun hasUserManagePermission(authorities: List<String>): Boolean =
        authorities.contains("user.manage")

    override fun hasGlobalPacketManagePermission(authorities: List<String>): Boolean =
        authorities.contains("packet.manage")

    override fun hasGlobalReadPermission(authorities: List<String>): Boolean =
        authorities.contains("packet.read")

    /** Manage packets */
    override fun canManageAllPackets(authorities: List<String>): Boolean =
        hasUserManagePermission(authorities) || hasGlobalPacketManagePermission(authorities)

    override fun hasPacketManagePermissionForGroup(
        authorities: List<String>,
        packetGroupName: String
    ): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.manage", packetGroupName))

    override fun canManagePacketGroup(authorities: List<String>, packetGroupName: String): Boolean =
        canManageAllPackets(authorities) || hasPacketManagePermissionForGroup(authorities, packetGroupName)

    override fun hasPacketManagePermissionForPacket(
        authorities: List<String>,
        packetGroupName: String,
        packetId: String
    ): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.manage", packetGroupName, packetId))

    override fun canManagePacket(
        authorities: List<String>,
        packetGroupName: String,
        packetId: String
    ): Boolean =
        canManagePacketGroup(authorities, packetGroupName) ||
            hasPacketManagePermissionForPacket(authorities, packetGroupName, packetId)

    /** Read packets */
    override fun canReadAllPackets(authorities: List<String>): Boolean =
        canManageAllPackets(authorities) || hasGlobalReadPermission(authorities)

    override fun hasPacketReadPermissionForGroup(authorities: List<String>, packetGroupName: String): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.read", packetGroupName))

    override fun canReadPacketGroup(authorities: List<String>, packetGroupName: String): Boolean =
        canReadAllPackets(authorities) ||
            canManagePacketGroup(authorities, packetGroupName) ||
            hasPacketReadPermissionForGroup(authorities, packetGroupName)

    override fun canManageAnyPacketInGroup(authorities: List<String>, packetGroupName: String): Boolean =
        authorities.any {
            it.startsWith("packet.manage:packet:$packetGroupName")
        }

    override fun canReadAnyPacketInGroup(authorities: List<String>, packetGroupName: String): Boolean =
        authorities.any {
            it.startsWith("packet.read:packet:$packetGroupName") ||
                canManageAnyPacketInGroup(authorities, packetGroupName)
        }

    override fun hasAnyPacketManagePermission(authorities: List<String>): Boolean =
        authorities.any {
            it.startsWith("packet.manage")
        }

    override fun hasPacketReadPermissionForPacket(
        authorities: List<String>,
        packetGroupName: String,
        packetId: String
    ): Boolean =
        authorities.contains(permissionService.buildScopedPermission("packet.read", packetGroupName, packetId))

    override fun canReadPacket(
        authorities: List<String>,
        packetGroup: String,
        packetId: String
    ): Boolean =
        canReadPacketGroup(authorities, packetGroup) ||
            canManagePacket(authorities, packetGroup, packetId) ||
            hasPacketReadPermissionForPacket(authorities, packetGroup, packetId)
}
