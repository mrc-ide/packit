package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Permission
import packit.model.RolePermission
import packit.repository.PermissionRepository

interface PermissionService
{
    fun checkMatchingPermissions(permissionsToCheck: List<String>): List<Permission>
    fun buildScopedPermission(rolePermission: RolePermission): String
    fun buildScopedPermission(
        permission: String,
        packetGroupName: String? = null,
        packetId: String? = null,
        tag: String? = null,
    ): String
}

@Service
class BasePermissionService(
    private val permissionRepository: PermissionRepository,
) : PermissionService
{
    override fun checkMatchingPermissions(permissionsToCheck: List<String>): List<Permission>
    {
        val matchedPermissions = permissionRepository.findByNameIn(permissionsToCheck)

        if (matchedPermissions.size != permissionsToCheck.size)
        {
            throw PackitException("invalidPermissionsProvided", HttpStatus.BAD_REQUEST)
        }
        return matchedPermissions
    }

    override fun buildScopedPermission(rolePermission: RolePermission): String
    {
        val packetGroupName = when
        {
            rolePermission.packet != null -> rolePermission.packet!!.name
            rolePermission.packetGroup != null -> rolePermission.packetGroup!!.name
            else -> null
        }
        return buildScopedPermission(
            rolePermission.permission.name, packetGroupName,
            rolePermission.packet?.id, rolePermission.tag?.name
        )
    }

    override fun buildScopedPermission(
        permission: String,
        packetGroupName: String?,
        packetId: String?,
        tag: String?,
    ): String
    {
        require(listOf(packetGroupName, tag).count { it != null } <= 1) {
            "Only one of packetGroupName or tag can be provided"
        }

        require(packetId == null || packetGroupName != null) {
            "packetGroupName must be provided if packetId is given"
        }

        return when
        {
            packetId != null -> "$permission:packet:$packetGroupName:$packetId"
            packetGroupName != null -> "$permission:packetGroup:$packetGroupName"
            tag != null -> "$permission:tag:$tag"
            else -> permission
        }
    }
}
