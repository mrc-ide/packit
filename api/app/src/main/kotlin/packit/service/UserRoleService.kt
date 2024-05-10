package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Role
import packit.model.User
import packit.model.dto.UpdateRoleUsers
import packit.model.dto.UpdateUserRoles

interface UserRoleService
{
    fun updateRoleUsers(roleName: String, usersToUpdate: UpdateRoleUsers): Role
    fun updateUserRoles(username: String, updateUserRoles: UpdateUserRoles): User
}

@Service
class BaseUserRoleService(
    private val roleService: RoleService,
    private val userService: UserService
) : UserRoleService
{
    override fun updateUserRoles(username: String, updateUserRoles: UpdateUserRoles): User
    {
        val user = userService.getByUsername(username)
            ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)

        val rolesToUpdate = getRolesForUpdate(updateUserRoles.roleNamesToAdd + updateUserRoles.roleNamesToRemove)
        addRolesToUser(user, rolesToUpdate.filter { it.name in updateUserRoles.roleNamesToAdd })
        removeRolesFromUser(user, rolesToUpdate.filter { it.name in updateUserRoles.roleNamesToRemove })

        return userService.saveUser(user)
    }

    override fun updateRoleUsers(roleName: String, usersToUpdate: UpdateRoleUsers): Role
    {
        val role = roleService.getByRoleName(roleName)
            ?: throw PackitException("roleNotFound", HttpStatus.BAD_REQUEST)
        if (role.isUsername)
        {
            throw PackitException("cannotUpdateUsernameRoles", HttpStatus.BAD_REQUEST)
        }
        val updateUsers =
            userService.getUsersByUsernames(usersToUpdate.usernamesToAdd + usersToUpdate.usernamesToRemove)

        addUsersToRole(role, updateUsers.filter { it.username in usersToUpdate.usernamesToAdd })
        removeUsersFromRole(role, updateUsers.filter { it.username in usersToUpdate.usernamesToRemove })

//        have to update users to save change as it is owner of many-to-many relationship
        userService.saveUsers(updateUsers)
        return role
    }

    internal fun addUsersToRole(role: Role, usersToAdd: List<User>)
    {
        for (user in usersToAdd)
        {
            if (user.roles.any { role == it })
            {
                throw PackitException("userRoleExists", HttpStatus.BAD_REQUEST)
            }
            user.roles.add(role)
            role.users.add(user)
        }
    }

    internal fun removeUsersFromRole(role: Role, usersToRemove: List<User>)
    {
        for (user in usersToRemove)
        {
            val matchedRole = user.roles.find { role == it }
                ?: throw PackitException("userRoleNotExists", HttpStatus.BAD_REQUEST)

            user.roles.remove(matchedRole)
            role.users.removeIf { it.id == user.id }
        }
    }

    internal fun getRolesForUpdate(roleNames: List<String>): List<Role>
    {
        val roles = roleService.getRolesByRoleNames(roleNames)
        if (roles.any { it.isUsername })
        {
            throw PackitException("cannotUpdateUsernameRoles", HttpStatus.BAD_REQUEST)
        }
        return roles
    }

    internal fun addRolesToUser(user: User, rolesToAdd: List<Role>)
    {
        if (rolesToAdd.any { user.roles.contains(it) })
        {
            throw PackitException("userRoleExists", HttpStatus.BAD_REQUEST)
        }
        user.roles.addAll(rolesToAdd)
    }

    internal fun removeRolesFromUser(user: User, rolesToRemove: List<Role>)
    {
        val matchedRolesToRemove = rolesToRemove.map { roleToRemove ->
            val matchedRole = user.roles.find { roleToRemove == it }
                ?: throw PackitException("userRoleNotExists", HttpStatus.BAD_REQUEST)

            matchedRole
        }
        user.roles.removeAll(matchedRolesToRemove)
    }
}
