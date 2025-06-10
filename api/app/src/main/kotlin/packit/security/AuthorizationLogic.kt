package packit.security

import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.stereotype.Component
import packit.model.Packet
import packit.model.PacketMetadata
import packit.security.ott.OTTAuthenticationToken
import packit.service.PacketService
import java.time.Instant

@Component("authz")
class AuthorizationLogic(
    private val packetService: PacketService,
    private val permissionChecker: PermissionChecker,
) {
    fun canReadPacket(operations: SecurityExpressionOperations, packet: Packet): Boolean =
        // TODO: update with tag when implemented
        permissionChecker.canReadPacket(
            getAuthorities(operations),
            packet.name,
            packet.id
        )

    fun canReadPacket(operations: SecurityExpressionOperations, id: String): Boolean {
        val packet = packetService.getPacket(id)
        return canReadPacket(operations, packet)
    }

    fun canViewPacketGroup(operations: SecurityExpressionOperations, name: String): Boolean {
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
        packetId: String,
    ): Boolean {
        val packet = packetService.getPacket(packetId)
        return permissionChecker.canManagePacket(getAuthorities(operations), packet.name, packet.id)
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
