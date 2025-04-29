package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.UpdateRolePermission

interface RolePermissionService
{
    fun updatePermissionsOnRole(
        role: Role,
        addRolePermissions: List<UpdateRolePermission>,
        removeRolePermissions: List<UpdateRolePermission>,
    ): Role

    fun applyPermissionToMultipleRoles(
        rolesToAdd: List<Role>,
        rolesToRemove: List<Role>,
        permissionName: String,
        packetGroupName: String,
        packetId: String? = null,
    ): List<Role>

    fun sortRolePermissions(rolePermissions: List<RolePermission>): List<RolePermission>
}

@Service
class BaseRolePermissionService(
    private val permissionService: PermissionService,
    private val packetService: PacketService,
    private val packetGroupService: PacketGroupService,
    private val tagService: TagService,
) : RolePermissionService
{
    override fun updatePermissionsOnRole(
        role: Role,
        addRolePermissions: List<UpdateRolePermission>,
        removeRolePermissions: List<UpdateRolePermission>
    ): Role
    {
        addPermissionsToRole(role, addRolePermissions)
        removeRolePermissionsFromRole(role, removeRolePermissions)

        return role
    }

    override fun applyPermissionToMultipleRoles(
        rolesToAdd: List<Role>,
        rolesToRemove: List<Role>,
        permissionName: String,
        packetGroupName: String,
        packetId: String?,
    ): List<Role>
    {
        val permission = permissionService.getByName(permissionName)
        val packet = packetId?.let { packetService.getPacket(it) }
        val packetGroup = if (packetId == null)
        {
            packetGroupService.getPacketGroupByName(packetGroupName)
        } else
        {
            require(packet?.name == packetGroupName) {
                "Packet group name must be the same as packet name when packetId is provided"
            }
            null
        }

        removePermissionFromRoles(
            rolesToRemove,
            permission,
            packet,
            packetGroup
        )
        addPermissionToRoles(
            rolesToAdd,
            permission,
            packet,
            packetGroup
        )

        return rolesToAdd + rolesToRemove
    }

    override fun sortRolePermissions(rolePermissions: List<RolePermission>): List<RolePermission>
    {
        return rolePermissions
            .sortedByDescending { it.tag == null && it.packet == null && it.packetGroup == null }
    }

    internal fun getRolePermissionsToUpdate(
        role: Role,
        updateRolePermissions: List<UpdateRolePermission>,
    ): List<RolePermission>
    {
        return updateRolePermissions.map { addRolePermission ->
            val permission = permissionService.getByName(addRolePermission.permission)

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

    internal fun removeRolePermissionsFromRole(role: Role, removeRolePermissions: List<UpdateRolePermission>)
    {
        val rolePermissionsToRemove = getRolePermissionsToUpdate(role, removeRolePermissions)

        for (rolePermission in rolePermissionsToRemove)
        {
            if (!role.rolePermissions.remove(rolePermission))
            {
                throw PackitException("rolePermissionDoesNotExist", HttpStatus.BAD_REQUEST)
            }
        }
    }

    internal fun addPermissionsToRole(
        role: Role,
        addRolePermissions: List<UpdateRolePermission>,
    )
    {
        val rolePermissionsToAdd = getRolePermissionsToUpdate(role, addRolePermissions)
        if (rolePermissionsToAdd.any { role.rolePermissions.contains(it) })
        {
            throw PackitException("rolePermissionAlreadyExists", HttpStatus.BAD_REQUEST)
        }
        role.rolePermissions.addAll(rolePermissionsToAdd)
    }

    internal fun addPermissionToRoles(
        roles: List<Role>,
        permission: Permission,
        packet: Packet? = null,
        packetGroup: PacketGroup? = null,
        tag: Tag? = null,
    )
    {
        for (role in roles)
        {
            val rolePermission = RolePermission(
                role = role,
                permission = permission,
                packet = packet,
                packetGroup = packetGroup,
                tag = tag,
            )
            if (role.rolePermissions.contains(rolePermission))
            {
                throw PackitException("rolePermissionAlreadyExists", HttpStatus.BAD_REQUEST)
            }
            role.rolePermissions.add(rolePermission)
        }
    }

    internal fun removePermissionFromRoles(
        roles: List<Role>,
        permission: Permission,
        packet: Packet? = null,
        packetGroup: PacketGroup? = null,
        tag: Tag? = null,
    )
    {
        for (role in roles)
        {
            val rolePermission = RolePermission(
                role = role,
                permission = permission,
                packet = packet,
                packetGroup = packetGroup,
                tag = tag,
            )
            if (!role.rolePermissions.remove(rolePermission))
            {
                throw PackitException("rolePermissionDoesNotExist", HttpStatus.BAD_REQUEST)
            }
        }
    }
}
