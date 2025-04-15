package packit.security

import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.stereotype.Component
import packit.model.Packet
import packit.security.ott.OTTAuthenticationToken
import packit.service.PacketService
import packit.service.PermissionService
import java.time.Instant

@Component("authz")
class AuthorizationLogic(
    private val packetService: PacketService,
    private val permissionService: PermissionService,
)
{
    fun canReadPacket(operations: SecurityExpressionOperations, packet: Packet): Boolean =
        // TODO: update with tag when implemented
        operations.hasAnyAuthority(
            "user.manage",
            "packet.read",
            permissionService.buildScopedPermission("packet.read", packet.name, packet.id),
            permissionService.buildScopedPermission("packet.read", packet.name),
            "packet.manage",
            permissionService.buildScopedPermission("packet.manage", packet.name, packet.id),
            permissionService.buildScopedPermission("packet.manage", packet.name)
        )

    fun canReadPacket(operations: SecurityExpressionOperations, id: String): Boolean
    {
        val packet = packetService.getPacket(id)
        return canReadPacket(operations, packet)
    }

    fun canReadPacketGroup(operations: SecurityExpressionOperations, name: String): Boolean
    {
        return operations.hasAnyAuthority(
            "user.manage",
            "packet.read",
            permissionService.buildScopedPermission("packet.read", name),
            "packet.manage",
            permissionService.buildScopedPermission("packet.manage", name),
        ) || canReadAnyPacketInGroup(operations, name)
    }

    fun canReadRoles(operations: SecurityExpressionOperations): Boolean
    {
        return operations.hasAuthority("user.manage") ||
                operations.authentication.authorities.any {
                    it.authority.startsWith("packet.manage")
                }
    }


    fun canUpdatePacketReadRoles(
        operations: SecurityExpressionOperations,
        packetGroupName: String,
        packetId: String? = null,
    ): Boolean
    {
        return when
        {
            operations.hasAnyAuthority("packet.manage", "user.manage") -> true
            // check if the user has permission to manage the packet group
            packetId == null -> operations.hasAnyAuthority(
                permissionService.buildScopedPermission("packet.manage", packetGroupName)
            )
            // check if the user has permission to manage the packet
            else -> operations.hasAnyAuthority(
                permissionService.buildScopedPermission("packet.manage", packetGroupName, packetId),
                permissionService.buildScopedPermission("packet.manage", packetGroupName)
            )
        }
    }

    fun oneTimeTokenValid(operations: SecurityExpressionOperations, packetId: String, path: String): Boolean {
        return validateOneTimeToken(operations, packetId, listOf(path))
    }

    fun oneTimeTokenValid(operations: SecurityExpressionOperations, packetId: String, paths: List<String>): Boolean {
        return validateOneTimeToken(operations, packetId, paths)
    }

    private fun validateOneTimeToken(
        operations: SecurityExpressionOperations,
        requestedPacketId: String,
        requestedPaths: List<String>,
    ): Boolean {
        val auth = operations.authentication as OTTAuthenticationToken
        val permittedPaths = auth.getPermittedFilePaths()

        return auth.getExpiresAt().isAfter(Instant.now()) &&
                auth.getPermittedPacketId() == requestedPacketId &&
                permittedPaths.containsAll(requestedPaths) &&
                permittedPaths.size == requestedPaths.size
    }

    internal fun canReadAnyPacketInGroup(
        operations: SecurityExpressionOperations,
        name: String,
    ): Boolean
    {
        return operations.authentication.authorities.any {
            it.authority.startsWith("packet.read:packet:$name") ||
                    it.authority.startsWith("packet.manage:packet:$name")
        }
    }
}
