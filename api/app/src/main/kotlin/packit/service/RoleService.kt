package packit.service

import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.Permission
import packit.model.Role
import packit.model.RolePermission
import packit.model.dto.*
import packit.model.toDto
import packit.repository.RoleRepository

interface RoleService
{
    fun getAdminRole(): Role
    fun getGrantedAuthorities(roles: List<Role>): MutableSet<GrantedAuthority>
    fun createRole(createRole: CreateRole): Role
    fun createUsernameRole(username: String): Role
    fun deleteRole(roleName: String)
    fun deleteUsernameRole(username: String)
    fun getRolesByRoleNames(roleNames: List<String>): List<Role>
    fun getAllRoles(isUsernames: Boolean?): List<Role>
    fun getRole(roleName: String): Role
    fun updatePermissionsToRole(roleName: String, updateRolePermissions: UpdateRolePermissions): Role
    fun getByRoleName(roleName: String): Role?
    fun getSortedRoleDtos(roles: List<Role>): List<RoleDto>
    fun getDefaultRoles(): List<Role>
    fun updatePacketReadPermissionOnRoles(updatePacketReadRoles: UpdatePacketReadRoles)
}

@Service
class BaseRoleService(
    private val appConfig: AppConfig,
    private val roleRepository: RoleRepository,
    private val permissionService: PermissionService,
    private val rolePermissionService: RolePermissionService,
) : RoleService
{
    override fun getAdminRole(): Role
    {
        return roleRepository.findByName("ADMIN")
            ?: throw PackitException("adminRoleNotFound", HttpStatus.INTERNAL_SERVER_ERROR)
    }

    override fun createRole(createRole: CreateRole): Role
    {
        val permissions = permissionService.checkMatchingPermissions(createRole.permissionNames)

        return saveRole(createRole.name, permissions)
    }

    override fun createUsernameRole(username: String): Role
    {
        val userRole = roleRepository.findByName(username)
        if (userRole != null)
        {
            throw PackitException("roleAlreadyExists", HttpStatus.BAD_REQUEST)
        }
        return roleRepository.save(Role(name = username, isUsername = true))
    }

    override fun deleteRole(roleName: String)
    {
        val roleToDelete = roleRepository.findByName(roleName)
            ?: throw PackitException("roleNotFound", HttpStatus.BAD_REQUEST)

        if (roleToDelete.name == "ADMIN" || roleToDelete.isUsername)
        {
            throw PackitException("cannotDeleteAdminOrUsernameRole", HttpStatus.BAD_REQUEST)
        }
        roleRepository.deleteByName(roleName)
    }

    override fun deleteUsernameRole(username: String)
    {
        val roleToDelete = roleRepository.findByName(username)
            ?: throw PackitException("roleNotFound", HttpStatus.INTERNAL_SERVER_ERROR)

        if (!roleToDelete.isUsername)
        {
            throw PackitException("roleIsNotUsername", HttpStatus.INTERNAL_SERVER_ERROR)
        }
        roleRepository.deleteByName(username)
    }

    override fun updatePermissionsToRole(roleName: String, updateRolePermissions: UpdateRolePermissions): Role
    {
        val role = roleRepository.findByName(roleName)
            ?: throw PackitException("roleNotFound", HttpStatus.BAD_REQUEST)

        val roleAfterPermissionAdd = addRolePermissionsToRole(role, updateRolePermissions.addPermissions)

        return rolePermissionService.removeRolePermissionsFromRole(
            roleAfterPermissionAdd,
            updateRolePermissions.removePermissions
        )
    }

    override fun getByRoleName(roleName: String): Role?
    {
        return roleRepository.findByName(roleName)
    }

    override fun getSortedRoleDtos(roles: List<Role>): List<RoleDto>
    {
        return roles.map { role ->
            role.apply {
                users = users.filterNot { it.isServiceUser() }.sortedBy { it.username }.toMutableList()
                rolePermissions = role.rolePermissions.sortedByDescending {
                    it.tag == null && it.packet == null && it.packetGroup == null
                }.toMutableList()
            }
            role.toDto()
        }
    }

    internal fun addRolePermissionsToRole(role: Role, addRolePermissions: List<UpdateRolePermission>): Role
    {
        val rolePermissionsToAdd =
            rolePermissionService.getRolePermissionsToAdd(role, addRolePermissions)
        role.rolePermissions.addAll(rolePermissionsToAdd)
        return roleRepository.save(role)
    }

    override fun getAllRoles(isUsernames: Boolean?): List<Role>
    {
        if (isUsernames == null)
        {
            return roleRepository.findAll(Sort.by("name").ascending())
        }
        return roleRepository.findAllByIsUsernameOrderByName(isUsernames)
    }

    override fun getRolesByRoleNames(roleNames: List<String>): List<Role>
    {
        val foundRoles = roleRepository.findByNameIn(roleNames)
        if (foundRoles.size != roleNames.toSet().size)
        {
            throw PackitException("invalidRolesProvided", HttpStatus.BAD_REQUEST)
        }
        return foundRoles
    }

    override fun getRole(roleName: String): Role
    {
        return roleRepository.findByName(roleName)
            ?: throw PackitException("roleNotFound", HttpStatus.BAD_REQUEST)
    }

    internal fun saveRole(roleName: String, permissions: List<Permission> = listOf()): Role
    {
        if (roleRepository.existsByName(roleName))
        {
            throw PackitException("roleAlreadyExists", HttpStatus.BAD_REQUEST)
        }
        val role = Role(name = roleName)
        role.rolePermissions = permissions.map { RolePermission(permission = it, role = role) }
            .toMutableList()
        return roleRepository.save(role)
    }

    override fun getGrantedAuthorities(roles: List<Role>): MutableSet<GrantedAuthority>
    {
        val grantedAuthorities = mutableSetOf<GrantedAuthority>()
        roles.forEach { role ->
            role.rolePermissions.forEach {
                grantedAuthorities.add(SimpleGrantedAuthority(permissionService.buildScopedPermission(it)))
            }
        }
        return grantedAuthorities
    }

    override fun getDefaultRoles(): List<Role>
    {
        return roleRepository.findByIsUsernameAndNameIn(isUsername = false, appConfig.defaultRoles)
    }

    override fun updatePacketReadPermissionOnRoles(
        updatePacketReadRoles: UpdatePacketReadRoles,
    )
    {
        val roleNamesToUpdate =
            getUniqueRoleNamesForUpdate(updatePacketReadRoles.roleNamesToAdd, updatePacketReadRoles.roleNamesToRemove)
        val rolesToUpdate =
            getRolesByRoleNames(roleNamesToUpdate.toList())

        rolePermissionService.updatePacketReadPermissionOnRoles(
            rolesToUpdate.filter { it.name in updatePacketReadRoles.roleNamesToAdd },
            rolesToUpdate.filter { it.name in updatePacketReadRoles.roleNamesToRemove },
            updatePacketReadRoles.packetGroupName,
            updatePacketReadRoles.packetId,
        )
    }

    internal fun getUniqueRoleNamesForUpdate(roleNamesToAdd: Set<String>, roleNamesToRemove: Set<String>): Set<String>
    {
        // Calculate symmetric difference (roles that appear in only one of the sets)
        val roleNamesToUpdate = (roleNamesToAdd - roleNamesToRemove) + (roleNamesToRemove - roleNamesToAdd)

        if (roleNamesToUpdate.isEmpty())
        {
            throw PackitException("noRolesToUpdateWithPermission", HttpStatus.BAD_REQUEST)
        }

        return roleNamesToUpdate
    }
}
