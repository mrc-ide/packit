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
        for (grantedAuth in operations.authentication.authorities)
        {
            if (grantedAuth.authority == "packet.read:packet:${id}")
            {
                return true
            }
            if (grantedAuth.authority == "packet.read:packetGroup:${packet.name}")
            {
                return true
            }
//            TODO: uncomment below when tags implemented
//            if (grantedAuth.authority == "packet.read:tag:${tag}")
//            {
//                return true
//            }
        }
        return false
    }

}