package packit.service

import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Permission
import packit.model.Role
import packit.model.RolePermission
import packit.model.dto.CreateRole
import packit.model.dto.RoleDto
import packit.model.dto.UpdateRolePermission
import packit.model.dto.UpdateRolePermissions
import packit.model.toDto
import packit.repository.RoleRepository

interface RoleService
{
    fun getUsernameRole(username: String): Role
    fun getAdminRole(): Role
    fun getGrantedAuthorities(roles: List<Role>): MutableList<GrantedAuthority>
    fun createRole(createRole: CreateRole): Role
    fun deleteRole(roleName: String)
    fun deleteUsernameRole(username: String)
    fun getRoleNames(): List<String>
    fun getRolesByRoleNames(roleNames: List<String>): List<Role>
    fun getAllRoles(isUsernames: Boolean?): List<Role>
    fun getRole(roleName: String): Role
    fun updatePermissionsToRole(roleName: String, updateRolePermissions: UpdateRolePermissions): Role
    fun getByRoleName(roleName: String): Role?
    fun getSortedByBasePermissionsRoleDtos(roles: List<Role>): List<RoleDto>
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

    override fun getSortedByBasePermissionsRoleDtos(roles: List<Role>): List<RoleDto>
    {
        return roles.map { role ->
            val roleDto = role.toDto()
            roleDto.rolePermissions =
                roleDto.rolePermissions.sortedByDescending { it.tag == null && it.packet == null && it.packetGroup == null }
            roleDto
        }
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
        return roleRepository.findAll(Sort.by("name").ascending()).map { it.name }
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
