package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Permission
import packit.model.Role
import packit.model.RolePermission
import packit.model.dto.CreateRole
import packit.model.dto.UpdateRolePermission
import packit.repository.RoleRepository

interface RoleService
{
    fun getUsernameRole(username: String): Role
    fun getAdminRole(): Role
    fun checkMatchingRoles(rolesToCheck: List<String>): List<Role>
    fun getGrantedAuthorities(roles: List<Role>): MutableList<GrantedAuthority>
    fun createRole(createRole: CreateRole): Role
    fun deleteRole(roleName: String)
    fun addPermissionsToRole(roleName: String, addRolePermissions: List<UpdateRolePermission>): Role
    fun removePermissionsFromRole(roleName: String, removeRolePermissions: List<UpdateRolePermission>)
    fun getRoleNames(): List<String>
    fun getRolesByRoleNames(roleNames: List<String>): List<Role>
    fun getAllRoles(isUsernames: Boolean?): List<Role>
    fun getRole(roleName: String): Role
}

@Service
class BaseRoleService(
    private val roleRepository: RoleRepository,
    private val permissionService: PermissionService,
    private val rolePermissionService: RolePermissionService
) : RoleService
{
    override fun getUsernameRole(username: String): Role
    {
        val userRole = roleRepository.findByName(username)

        if (userRole != null)
        {
            return userRole
        }
        return roleRepository.save(Role(name = username, isUsername = true))
    }

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

    override fun deleteRole(roleName: String)
    {
        if (!roleRepository.existsByName(roleName) || roleName == "ADMIN")
        {
            throw PackitException("roleNotFound", HttpStatus.BAD_REQUEST)
        }
        roleRepository.deleteByName(roleName)
    }

    override fun addPermissionsToRole(roleName: String, addRolePermissions: List<UpdateRolePermission>): Role
    {
        val role = roleRepository.findByName(roleName)
            ?: throw PackitException("roleNotFound", HttpStatus.BAD_REQUEST)

        val rolePermissionsToAdd = rolePermissionService.getAddRolePermissionsFromRole(role, addRolePermissions)

        role.rolePermissions.addAll(rolePermissionsToAdd)
        
        return roleRepository.save(role)
    }

    override fun removePermissionsFromRole(roleName: String, removeRolePermissions: List<UpdateRolePermission>)
    {
        val role = roleRepository.findByName(roleName)
            ?: throw PackitException("roleNotFound", HttpStatus.BAD_REQUEST)
        rolePermissionService.removeRolePermissionsFromRole(role, removeRolePermissions)
    }

    override fun getRoleNames(): List<String>
    {
        return roleRepository.findAll().map { it.name }
    }

    override fun getAllRoles(isUsernames: Boolean?): List<Role>
    {
        if (isUsernames == null)
        {
            return roleRepository.findAll()
        }
        return roleRepository.findAllByIsUsername(isUsernames)
    }

    override fun getRolesByRoleNames(roleNames: List<String>): List<Role>
    {
        val foundRoles = roleRepository.findByNameIn(roleNames)
        if (foundRoles.size != roleNames.size)
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

    override fun checkMatchingRoles(rolesToCheck: List<String>): List<Role>
    {
        val matchedRoles = roleRepository.findByNameIn(rolesToCheck)

        if (matchedRoles.size != rolesToCheck.size)
        {
            throw PackitException("invalidRolesProvided", HttpStatus.BAD_REQUEST)
        }
        return matchedRoles
    }

    /**
     * Authorities constructed as combination of role names and permission names.
     * This allows for more granular control over permissions.
     */
    override fun getGrantedAuthorities(roles: List<Role>): MutableList<GrantedAuthority>
    {
        val grantedAuthorities = mutableListOf<GrantedAuthority>()
        roles.forEach { role ->
            grantedAuthorities.add(SimpleGrantedAuthority(role.name))
            role.rolePermissions.forEach {
                grantedAuthorities.add(SimpleGrantedAuthority(getPermissionScoped(it)))
            }
        }
        return grantedAuthorities
    }

    internal fun getPermissionScoped(rolePermission: RolePermission): String
    {
        val scopeString = when
        {
            rolePermission.packet != null -> ":packet:${rolePermission.packet!!.id}"
            rolePermission.packetGroup != null -> ":packetGroup:${rolePermission.packetGroup!!.id}"
            rolePermission.tag != null -> ":tag:${rolePermission.tag!!.id}"
            else -> ""
        }

        return rolePermission.permission.name + scopeString
    }
}
