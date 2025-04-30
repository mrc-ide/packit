package packit.security

import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.stereotype.Component
import packit.model.Packet
import packit.service.PacketService

@Component("authz")
class AuthorizationLogic(
    private val packetService: PacketService,
    private val permissionChecker: PermissionChecker,
)
{
    fun canReadPacket(operations: SecurityExpressionOperations, packet: Packet): Boolean =
        // TODO: update with tag when implemented
        permissionChecker.canReadPacket(
            getAuthorities(operations),
            packet.name,
            packet.id
        )

    fun canReadPacket(operations: SecurityExpressionOperations, id: String): Boolean
    {
        val packet = packetService.getPacket(id)
        return canReadPacket(operations, packet)
    }

    fun canViewPacketGroup(operations: SecurityExpressionOperations, name: String): Boolean
    {
        return permissionChecker.canReadPacketGroup(
            getAuthorities(operations),
            name
        ) || permissionChecker.canReadAnyPacketInGroup(
            getAuthorities(operations),
            name
        )
    }

    fun canUpdatePacketReadRoles(
        operations: SecurityExpressionOperations,
        packetGroupName: String,
        packetId: String,
    ): Boolean =
        permissionChecker.canManagePacket(getAuthorities(operations), packetGroupName, packetId)

    fun canUpdatePacketGroupReadRoles(
        operations: SecurityExpressionOperations,
        packetGroupName: String,
    ): Boolean =
        permissionChecker.canManagePacketGroup(getAuthorities(operations), packetGroupName)

    fun canManageAnyPacket(operations: SecurityExpressionOperations): Boolean =
        permissionChecker.hasAnyPacketManagePermission(getAuthorities(operations))

    internal fun getAuthorities(operations: SecurityExpressionOperations) =
        operations.authentication.authorities.map { it.authority }
}
