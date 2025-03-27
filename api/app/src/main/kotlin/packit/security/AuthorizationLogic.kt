package packit.security

import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.stereotype.Component
import packit.model.Packet
import packit.service.PacketService
import packit.service.PermissionService

@Component("authz")
class AuthorizationLogic(
    private val packetService: PacketService,
    private val permissionService: PermissionService
)
{
    fun canReadPacket(operations: SecurityExpressionOperations, packet: Packet): Boolean =
        // TODO: update with tag when implemented
        operations.hasAnyAuthority(
            "packet.read",
            permissionService.getPermissionScoped("packet.read", packet.name, packet.id),
            permissionService.getPermissionScoped("packet.read", packet.name),
            "packet.manage",
            permissionService.getPermissionScoped("packet.manage", packet.name, packet.id),
            permissionService.getPermissionScoped("packet.manage", packet.name)
        )


    fun canReadPacket(operations: SecurityExpressionOperations, id: String): Boolean
    {
        val packet = packetService.getPacket(id)
        return canReadPacket(operations, packet)
    }

    fun canReadPacketGroup(operations: SecurityExpressionOperations, name: String): Boolean
    {
        return operations.hasAnyAuthority(
            "packet.read",
            permissionService.getPermissionScoped("packet.read", name),
            "packet.manage",
            permissionService.getPermissionScoped("packet.manage", name),
        ) || canReadAnyPacketInGroup(operations, name)
    }

    fun canReadRoles(operations: SecurityExpressionOperations): Boolean
    {
        return operations.hasAuthority("user.manage") ||
                operations.authentication.authorities.any {
                    it.authority.contains("packet.manage")
                }
    }

    internal fun canReadAnyPacketInGroup(
        operations: SecurityExpressionOperations,
        name: String
    ): Boolean
    {
        return operations.authentication.authorities.any {
            it.authority.contains("packet.read:packet:$name") ||
                    it.authority.contains("packet.manage:packet:$name")
        }
    }
}
