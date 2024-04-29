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
import packit.repository.RoleRepository

interface RoleService
{
    fun getUsernameRole(username: String): Role
    fun getAdminRole(): Role
    fun saveRole(roleName: String, permissions: List<Permission>)
    fun checkMatchingRoles(rolesToCheck: List<String>): List<Role>
    fun getGrantedAuthorities(roles: List<Role>): MutableList<GrantedAuthority>
    fun createRole(createRole: CreateRole)
}

@Service
class BaseRoleService(
    private val roleRepository: RoleRepository,
    private val permissionService: PermissionService
) : RoleService
{
    override fun getUsernameRole(username: String): Role
    {
        val userRole = roleRepository.findByName(username)

        if (userRole != null)
        {
            return userRole
        }
        return roleRepository.save(Role(name = username))
    }

    override fun getAdminRole(): Role
    {
        val userRole = roleRepository.findByName("ADMIN")

        if (userRole != null)
        {
            return userRole
        }
        return roleRepository.save(Role(name = "ADMIN"))
    }

    override fun createRole(createRole: CreateRole)
    {
        val permissions = permissionService.checkMatchingPermissions(createRole.permissions)

        saveRole(createRole.name, permissions)
    }

    override fun saveRole(roleName: String, permissions: List<Permission>)
    {
        if (roleRepository.existsByName(roleName))
        {
            throw PackitException("roleAlreadyExists")
        }
        val role = Role(name = roleName)
        role.rolePermissions = permissions.map { RolePermission(permission = it, role = role) }
            .toMutableList()
        roleRepository.save(role)
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
     * Authorizes constructed as combination of role names and permission names.
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
