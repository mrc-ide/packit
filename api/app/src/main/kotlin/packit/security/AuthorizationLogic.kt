package packit.security

import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.stereotype.Component
import packit.service.PacketService

@Component("authz")
class AuthorizationLogic(
    private val packetService: PacketService
)
{
    fun canReadPacketMetadata(operations: MethodSecurityExpressionOperations, id: String): Boolean
    {
        val packet = packetService.getPacket(id)
        return canReadPacket(operations, packet.id, packet.name)
    }

    fun canReadPacket(operations: MethodSecurityExpressionOperations, id: String, name: String): Boolean
    {
        // TODO: update with tag when implemented
        return operations.hasAnyAuthority(
            "packet.read",
            "packet.read:packet:$name:$id",
            "packet.read:packetGroup:$name"
        )
    }

    fun canReadPacketGroup(operations: MethodSecurityExpressionOperations, name: String): Boolean
    {
        return operations.hasAnyAuthority("packet.read", "packet.read:packetGroup:$name") ||
                operations.authentication.authorities.any { it.authority.contains("packet.read:packet:$name") }
    }
}
