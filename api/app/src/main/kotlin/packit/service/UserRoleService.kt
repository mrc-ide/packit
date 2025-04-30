package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Role
import packit.model.RolePermission
import packit.model.User
import packit.model.dto.*
import packit.security.PermissionChecker

interface UserRoleService
{
    fun updateRoleUsers(roleName: String, usersToUpdate: UpdateRoleUsers): Role
    fun updateUserRoles(username: String, updateUserRoles: UpdateUserRoles): User
    fun getAllRolesAndUsersWithPermissions(): RolesAndUsersWithPermissionsDto
    fun getRolesAndUsersForReadPermissionUpdate(packetGroupName: String): RolesToUpdatePacketGroupRead
}

@Service
class BaseUserRoleService(
    private val roleService: RoleService,
    private val userService: UserService,
    private val permissionService: PermissionService,
    private val permissionChecker: PermissionChecker,
) : UserRoleService
{
    override fun updateUserRoles(username: String, updateUserRoles: UpdateUserRoles): User
    {
        val user = userService.getByUsername(username)
            ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)

        if (user.isServiceUser())
        {
            throw PackitException("cannotModifyServiceUser", HttpStatus.BAD_REQUEST)
        }

        val rolesToUpdate = getRolesForUpdate(updateUserRoles.roleNamesToAdd + updateUserRoles.roleNamesToRemove)
        addRolesToUser(user, rolesToUpdate.filter { it.name in updateUserRoles.roleNamesToAdd })
        removeRolesFromUser(user, rolesToUpdate.filter { it.name in updateUserRoles.roleNamesToRemove })

        return userService.saveUser(user)
    }

    override fun getAllRolesAndUsersWithPermissions(): RolesAndUsersWithPermissionsDto
    {
        return createSortedRolesAndUsersWithPermissionsDto(getNonUsernameRolesAndNonServiceUsers())
    }

    override fun getRolesAndUsersForReadPermissionUpdate(packetGroupName: String): RolesToUpdatePacketGroupRead
    {
        val (roles, users) = getNonUsernameRolesAndNonServiceUsers()

        return RolesToUpdatePacketGroupRead(
            cantReadGroup = createSortedRolesAndUsersWithPermissionsDto(
                getRolesAndUsersCantReadGroup(
                    roles,
                    users,
                    packetGroupName
                )
            ),
            withReadGroup = createSortedRolesAndUsersWithPermissionsDto(
                getRolesAndUsersWithOnlyReadGroup(
                    roles,
                    users,
                    packetGroupName
                )
            )
        )
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

        if (updateUsers.any { it.isServiceUser() })
        {
            throw PackitException("cannotModifyServiceUser", HttpStatus.BAD_REQUEST)
        }

        addUsersToRole(role, updateUsers.filter { it.username in usersToUpdate.usernamesToAdd })
        removeUsersFromRole(role, updateUsers.filter { it.username in usersToUpdate.usernamesToRemove })

        // have to update users to save change as it is owner of many-to-many relationship
        userService.saveUsers(updateUsers)
        return role
    }

    internal fun createSortedRolesAndUsersWithPermissionsDto(rolesAndUsers: RolesAndUsers): RolesAndUsersWithPermissionsDto
    {
        return RolesAndUsersWithPermissionsDto(
            roleService.getSortedRoleDtos(rolesAndUsers.roles),
            userService.getSortedUsersWithPermissions(rolesAndUsers.users)
        )
    }

    internal fun getNonUsernameRolesAndNonServiceUsers(): RolesAndUsers
    {
        val roles = roleService.getAllRoles(isUsernames = false)
        val users = userService.getAllNonServiceUsers()
        return RolesAndUsers(roles, users)
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

    internal fun getRolesAndUsersWithOnlyReadGroup(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers
    {
        val rolesWithRead =
            roles.filter { hasOnlyReadGroupPermission(it.rolePermissions, packetGroupName) }
        val usersWithRead =
            users.filter { user ->
                hasOnlyReadGroupPermission(user.getSpecificPermissions(), packetGroupName)
            }

        return RolesAndUsers(
            rolesWithRead,
            usersWithRead,
        )
    }

    internal fun hasOnlyReadGroupPermission(permissions: List<RolePermission>, packetGroupName: String): Boolean
    {
        val permissionNames = permissionService.mapToScopedPermission(permissions)
        return permissionChecker.hasPacketReadPermissionForGroup(permissionNames, packetGroupName)
                && !permissionChecker.canReadAllPackets(permissionNames)
                && !permissionChecker.canManagePacketGroup(permissionNames, packetGroupName)
    }

    internal fun getRolesAndUsersCantReadGroup(
        roles: List<Role>,
        users: List<User>,
        packetGroupName: String
    ): RolesAndUsers
    {
        val rolesCantRead = roles.filterNot {
            permissionChecker.canReadPacketGroup(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packetGroupName
            )
        }

        val usersCantRead = users.filter { user ->
            !userHasDirectReadPermission(user, packetGroupName) &&
                    !userHasReadPermissionViaRole(user, roles, packetGroupName)
        }

        return RolesAndUsers(
            rolesCantRead,
            usersCantRead
        )
    }

    internal fun userHasDirectReadPermission(user: User, packetGroupName: String): Boolean =
        permissionChecker.canReadPacketGroup(
            permissionService.mapToScopedPermission(user.getSpecificPermissions()),
            packetGroupName
        )

    internal fun userHasReadPermissionViaRole(
        user: User,
        roles: List<Role>,
        packetGroupName: String
    ): Boolean =
        user.roles.filterNot { it.isUsername }.any {
            permissionChecker.canReadPacketGroup(
                permissionService.mapToScopedPermission(it.rolePermissions),
                packetGroupName
            )
        }

}
