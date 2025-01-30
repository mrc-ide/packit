package packit.security

import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.stereotype.Component
import packit.model.Packet
import packit.service.PacketService

@Component("authz")
class AuthorizationLogic(
    private val packetService: PacketService
)
{
    fun canReadPacket(operations: SecurityExpressionOperations, packet: Packet): Boolean
    {
        // TODO: update with tag when implemented
        return operations.hasAnyAuthority(
            "packet.read",
            "packet.read:packet:${packet.name}:${packet.id}",
            "packet.read:packetGroup:${packet.name}"
        )
    }

    fun canReadPacket(operations: SecurityExpressionOperations, id: String): Boolean
    {
        val packet = packetService.getPacket(id)
        return canReadPacket(operations, packet)
    }

    fun canReadPacketGroup(operations: SecurityExpressionOperations, name: String): Boolean
    {
        return operations.hasAnyAuthority("packet.read", "packet.read:packetGroup:$name") ||
                operations.authentication.authorities.any { it.authority.contains("packet.read:packet:$name") }
    }
}
