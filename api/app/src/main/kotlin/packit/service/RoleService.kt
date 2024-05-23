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
import packit.model.dto.UpdateRolePermissions
import packit.repository.RoleRepository

interface RoleService
{
    fun getUsernameRole(username: String): Role
    fun getAdminRole(): Role
    fun getGrantedAuthorities(roles: List<Role>): MutableSet<GrantedAuthority>
    fun createRole(createRole: CreateRole): Role
    fun deleteRole(roleName: String)
    fun deleteUsernameRole(username: String)
    fun getRoleNames(): List<String>
    fun getRolesByRoleNames(roleNames: List<String>): List<Role>
    fun getAllRoles(isUsernames: Boolean?): List<Role>
    fun getRole(roleName: String): Role
    fun updatePermissionsToRole(roleName: String, updateRolePermissions: UpdateRolePermissions): Role
    fun getByRoleName(roleName: String): Role?
}

@Service
class BaseRoleService(
    private val roleRepository: RoleRepository,
    private val permissionService: PermissionService,
    private val rolePermissionService: RolePermissionService,
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

    internal fun addRolePermissionsToRole(role: Role, addRolePermissions: List<UpdateRolePermission>): Role
    {
        val rolePermissionsToAdd =
            rolePermissionService.getRolePermissionsToAdd(role, addRolePermissions)
        role.rolePermissions.addAll(rolePermissionsToAdd)
        return roleRepository.save(role)
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
