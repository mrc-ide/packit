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
    fun getPermissionScoped(rolePermission: RolePermission): String
    fun getPermissionScoped(
        permission: String,
        packetGroupName: String? = null,
        packetId: String? = null,
        tag: String? = null
    ): String
}

@Service
class BasePermissionService(
    private val permissionRepository: PermissionRepository
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

    override fun getPermissionScoped(rolePermission: RolePermission): String
    {
        val packetGroupName = when
        {
            rolePermission.packet != null -> rolePermission.packet!!.name
            rolePermission.packetGroup != null -> rolePermission.packetGroup!!.name
            else -> null
        }
        return getPermissionScoped(
            rolePermission.permission.name, packetGroupName,
            rolePermission.packet?.id, rolePermission.tag?.name
        )
    }

    override fun getPermissionScoped(
        permission: String,
        packetGroupName: String?,
        packetId: String?,
        tag: String?
    ): String
    {
        return when
        {
            packetId != null && packetGroupName != null -> "$permission:packet:$packetGroupName:$packetId"
            packetGroupName != null -> "$permission:packetGroup:$packetGroupName"
            tag != null -> "$permission:tag:$tag"
            else -> permission
        }
    }
}
