package packit.security

import org.springframework.security.access.AccessDeniedException
import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.model.Packet
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
        try {
            val packet = packetService.getPacket(id)
            return canReadPacket(operations, packet)
        } catch (e: PackitException) {
            // pass through PackitException to allow handling in the controller
            throw AccessDeniedException("Access Denied", e)
        }
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
        try {
            val packet = packetService.getPacket(packetId)
            return permissionChecker.canManagePacket(getAuthorities(operations), packet.name, packet.id)
        } catch (e: PackitException) {
            // pass through PackitException to allow handling in the controller
            throw AccessDeniedException("Access Denied", e)
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

    fun canUpdatePacketGroupReadRoles(
        operations: SecurityExpressionOperations,
        packetGroupName: String,
    ): Boolean =
        permissionChecker.canManagePacketGroup(getAuthorities(operations), packetGroupName)

    fun hasGlobalPacketManagePermission(operations: SecurityExpressionOperations): Boolean =
        permissionChecker.hasGlobalPacketManagePermission(getAuthorities(operations))

    internal fun getAuthorities(operations: SecurityExpressionOperations) =
        operations.authentication.authorities.map { it.authority }
}
