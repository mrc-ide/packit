package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.*

interface UserRoleService
{
    fun updateRoleUsers(roleName: String, usersToUpdate: UpdateRoleUsers): Role
    fun updateUserRoles(username: String, updateUserRoles: UpdateUserRoles): User
    fun getAllRolesAndUsersWithPermissions(): RolesAndUsersWithPermissionsDto
    fun getRolesAndUsersForPacketGroupReadUpdate(
        packetGroupNames: List<String>
    ): Map<String, RolesAndUsersForReadUpdate>

    fun getRolesAndUsersForPacketReadUpdate(packet: Packet): RolesAndUsersForReadUpdate
    fun getUserAuthorities(username: String): List<String>
}

@Service
class BaseUserRoleService(
    private val roleService: RoleService,
    private val userService: UserService,
    private val userRoleFilterService: UserRoleFilterService
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

    override fun getRolesAndUsersForPacketGroupReadUpdate(
        packetGroupNames: List<String>
    ): Map<String, RolesAndUsersForReadUpdate>
    {
        val (roles, users) = getNonUsernameRolesAndNonServiceUsers()
        return packetGroupNames.associateWith {
            RolesAndUsersForReadUpdate(
                canRead = createSortedBasicRolesAndUsers(
                    userRoleFilterService.getRolesAndSpecificUsersCanReadPacketGroup(roles, users, it)
                ),
                cantRead = createSortedBasicRolesAndUsers(
                    userRoleFilterService.getRolesAndUsersCantReadPacketReadGroup(roles, users, it)
                ),
                withRead = createSortedBasicRolesAndUsers(
                    userRoleFilterService.getRolesAndUsersWithSpecificReadPacketGroupPermission(roles, users, it)
                )
            )
        }
    }

    override fun getRolesAndUsersForPacketReadUpdate(packet: Packet): RolesAndUsersForReadUpdate
    {
        val (roles, users) = getNonUsernameRolesAndNonServiceUsers()

        return RolesAndUsersForReadUpdate(
            canRead = createSortedBasicRolesAndUsers(
                userRoleFilterService.getRolesAndSpecificUsersCanReadPacket(roles, users, packet)
            ),
            cantRead = createSortedBasicRolesAndUsers(
                userRoleFilterService.getRolesAndUsersCantReadPacket(roles, users, packet)
            ),
            withRead = createSortedBasicRolesAndUsers(
                userRoleFilterService.getRolesAndUsersWithSpecificReadPacketPermission(roles, users, packet),
            )
        )
    }

    override fun getUserAuthorities(username: String): List<String>
    {
        val user = userService.getByUsername(username)
            ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)

        return roleService.getGrantedAuthorities(user.roles).map { it.authority }
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

    internal fun createSortedRolesAndUsersWithPermissionsDto(
        rolesAndUsers: RolesAndUsers
    ): RolesAndUsersWithPermissionsDto
    {
        return RolesAndUsersWithPermissionsDto(
            roleService.getSortedRoles(rolesAndUsers.roles).map { it.toDto() },
            userService.getSortedUsers(rolesAndUsers.users).map { it.toUserWithPermissions() }
        )
    }

    internal fun createSortedBasicRolesAndUsers(
        rolesAndUsers: RolesAndUsers
    ): BasicRolesAndUsersDto
    {
        return BasicRolesAndUsersDto(
            roleService.getSortedRoles(rolesAndUsers.roles).map { it.toBasicRoleWithUsersDto() },
            userService.getSortedUsers(rolesAndUsers.users).map { it.toBasicDto() }
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
}
