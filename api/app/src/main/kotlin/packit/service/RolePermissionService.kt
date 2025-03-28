package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.UpdateRolePermission
import packit.repository.RolePermissionRepository

interface RolePermissionService
{
    fun removeRolePermissionsFromRole(role: Role, removeRolePermissions: List<UpdateRolePermission>): Role
    fun getRolePermissionsToAdd(role: Role, addRolePermissions: List<UpdateRolePermission>): List<RolePermission>
    fun updatePacketReadPermissionOnRoles(
        rolesToAdd: List<Role>,
        rolesToRemove: List<Role>,
        packetId: String? = null,
        packetGroupId: Int? = null,
    ): List<Role>
}

@Service
class BaseRolePermissionService(
    private val permissionService: PermissionService,
    private val packetService: PacketService,
    private val packetGroupService: PacketGroupService,
    private val tagService: TagService,
    private val rolePermissionRepository: RolePermissionRepository,
) : RolePermissionService
{
    internal fun getRolePermissionsToUpdate(
        role: Role,
        updateRolePermissions: List<UpdateRolePermission>,
    ): List<RolePermission>
    {
        return updateRolePermissions.map { addRolePermission ->
            val permission = permissionService.getPermissionByName(addRolePermission.permission)

            RolePermission(
                role = role,
                permission = permission,
                packet = addRolePermission.packetId?.let {
                    packetService.getPacket(it)
                },
                packetGroup = addRolePermission.packetGroupId?.let {
                    packetGroupService.getPacketGroup(it)
                },
                tag = addRolePermission.tagId?.let {
                    tagService.getTag(it)
                }
            )
        }
    }

    internal fun addPermissionToRoles(
        roles: List<Role>,
        permission: Permission,
        packet: Packet? = null,
        packetGroup: PacketGroup? = null,
    ): List<Role>
    {
        for (role in roles)
        {
            val rolePermission = RolePermission(
                role = role,
                permission = permission,
                packet = packet,
                packetGroup = packetGroup
            )
            if (role.rolePermissions.any { it == rolePermission })
            {
                throw PackitException("rolePermissionAlreadyExists", HttpStatus.BAD_REQUEST)
            }
            role.rolePermissions.add(rolePermission)
        }
        return roles
    }

    internal fun removePermissionFromRoles(
        roles: List<Role>,
        permission: Permission,
        packet: Packet? = null,
        packetGroup: PacketGroup? = null,
    )
    {
        val rolePermissionsToRemoveIds = mutableListOf<Int>()

        for (role in roles)
        {
            val rolePermission = RolePermission(
                role = role,
                permission = permission,
                packet = packet,
                packetGroup = packetGroup
            )
            val matchedRolePermission = role.rolePermissions.find { it == rolePermission }
                ?: throw PackitException("rolePermissionDoesNotExist", HttpStatus.BAD_REQUEST)

            rolePermissionsToRemoveIds.add(matchedRolePermission.id!!)
            role.rolePermissions.remove(matchedRolePermission)
        }

        rolePermissionRepository.deleteAllByIdIn(rolePermissionsToRemoveIds)
    }

    override fun removeRolePermissionsFromRole(role: Role, removeRolePermissions: List<UpdateRolePermission>): Role
    {
        val rolePermissionsToRemove = getRolePermissionsToUpdate(role, removeRolePermissions)
        val rolePermissionsToRemoveIds = mutableListOf<Int>()

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
        addRolePermissions: List<UpdateRolePermission>,
    ): List<RolePermission>
    {
        val rolePermissionsToAdd = getRolePermissionsToUpdate(role, addRolePermissions)
        if (rolePermissionsToAdd.any { role.rolePermissions.contains(it) })
        {
            throw PackitException("rolePermissionAlreadyExists", HttpStatus.BAD_REQUEST)
        }

        return rolePermissionsToAdd
    }

    override fun updatePacketReadPermissionOnRoles(
        rolesToAdd: List<Role>,
        rolesToRemove: List<Role>,
        packetId: String?,
        packetGroupId: Int?,
    ): List<Role>
    {
        val permission = permissionService.getPermissionByName("packet.read")
        val packet = packetId?.let {
            packetService.getPacket(it)
        }
        val packetGroup = packetGroupId?.let {
            packetGroupService.getPacketGroup(it)
        }

        removePermissionFromRoles(
            rolesToRemove,
            permission,
            packet,
            packetGroup
        )
        return addPermissionToRoles(
            rolesToAdd,
            permission,
            packet,
            packetGroup
        )
    }
}
