package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Role
import packit.repository.RoleRepository

interface RoleService
{
    fun getUsernameRole(username: String): Role
    fun getAdminRole(): Role
    fun saveRole(roleName: String)
    fun checkMatchingRoles(rolesToCheck: List<String>): List<Role>
    fun getGrantedAuthorities(roles: List<Role>): MutableList<GrantedAuthority>
}

@Service
class BaseRoleService(
    private val roleRepository: RoleRepository
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

    override fun saveRole(roleName: String)
    {
        if (roleRepository.existsByName(roleName))
        {
            throw PackitException("roleAlreadyExists")
        }
        val role = Role(name = roleName)
        roleRepository.save(role)
    }

    override fun checkMatchingRoles(rolesToCheck: List<String>): List<Role>
    {
        val allRoles = roleRepository.findAll()
        val foundRoles = rolesToCheck.mapNotNull { name -> allRoles.find { it.name == name } }

        if (foundRoles.size != rolesToCheck.size)
        {
            throw PackitException("invalidRolesProvided", HttpStatus.BAD_REQUEST)
        }
        return foundRoles
    }

    override fun getGrantedAuthorities(roles: List<Role>): MutableList<GrantedAuthority>
    {
        val grantedAuthorities = mutableListOf<GrantedAuthority>()
        roles.forEach { role ->
            grantedAuthorities.add(SimpleGrantedAuthority(role.name))
            role.rolePermissions.forEach { rolePermission ->
                grantedAuthorities.add(SimpleGrantedAuthority(rolePermission.permission.name))
            }
        }
        return grantedAuthorities
    }
}