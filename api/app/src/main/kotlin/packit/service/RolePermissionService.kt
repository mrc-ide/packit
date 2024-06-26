package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Role
import packit.model.RolePermission
import packit.model.dto.UpdateRolePermission
import packit.repository.*

interface RolePermissionService
{
    fun removeRolePermissionsFromRole(role: Role, removeRolePermissions: List<UpdateRolePermission>): Role
    fun getRolePermissionsToAdd(role: Role, addRolePermissions: List<UpdateRolePermission>): List<RolePermission>
}

@Service
class BaseRolePermissionService(
    private val permissionRepository: PermissionRepository,
    private val packetRepository: PacketRepository,
    private val packetGroupRepository: PacketGroupRepository,
    private val tagRepository: TagRepository,
    private val rolePermissionRepository: RolePermissionRepository
) : RolePermissionService
{
    internal fun getRolePermissionsToUpdate(
        role: Role,
        updateRolePermissions: List<UpdateRolePermission>
    ): List<RolePermission>
    {
        return updateRolePermissions.map { addRolePermission ->
            val permission = permissionRepository.findByName(addRolePermission.permission)
                ?: throw PackitException("invalidPermissionsProvided", HttpStatus.BAD_REQUEST)

            RolePermission(
                role = role,
                permission = permission,
                packet = addRolePermission.packetId?.let {
                    packetRepository.findById(it)
                        .orElseThrow { PackitException("packetNotFound", HttpStatus.BAD_REQUEST) }
                },
                packetGroup = addRolePermission.packetGroupId?.let {
                    packetGroupRepository.findById(it)
                        .orElseThrow { PackitException("packetGroupNotFound", HttpStatus.BAD_REQUEST) }
                },
                tag = addRolePermission.tagId?.let {
                    tagRepository.findById(it).orElseThrow { PackitException("tagNotFound", HttpStatus.BAD_REQUEST) }
                }
            )
        }
    }

    override fun removeRolePermissionsFromRole(role: Role, removeRolePermissions: List<UpdateRolePermission>): Role
    {
        val rolePermissionsToRemove = getRolePermissionsToUpdate(role, removeRolePermissions)
        var rolePermissionsToRemoveIds = mutableListOf<Int>()

        for (rolePermission in rolePermissionsToRemove)
        {
            val matchedRolePermission = role.rolePermissions.find { rolePermission == it }
                ?: throw PackitException("rolePermissionDoesNotExist", HttpStatus.BAD_REQUEST)

            rolePermissionsToRemoveIds.add(matchedRolePermission.id!!)
            role.rolePermissions.remove(matchedRolePermission)
        }

        rolePermissionRepository.deleteAllByIdIn(rolePermissionsToRemoveIds)
        return role
    }

    override fun getRolePermissionsToAdd(
        role: Role,
        addRolePermissions: List<UpdateRolePermission>
    ): List<RolePermission>
    {
        val rolePermissionsToAdd = getRolePermissionsToUpdate(role, addRolePermissions)
        if (rolePermissionsToAdd.any { role.rolePermissions.contains(it) })
        {
            throw PackitException("rolePermissionAlreadyExists", HttpStatus.BAD_REQUEST)
        }

        return rolePermissionsToAdd
    }
}
