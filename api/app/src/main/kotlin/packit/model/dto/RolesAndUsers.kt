package packit.model.dto

import packit.model.Role
import packit.model.User

data class RolesAndUsers(
    val roles: List<Role> = listOf(),
    val users: List<User> = listOf()
)

data class RolesAndUsersWithPermissionsDto(
    val roles: List<RoleDto> = listOf(),
    val users: List<UserWithPermissions> = listOf()
)

data class BasicRolesAndUsersDto(
    val roles: List<BasicRoleWithUsersDto> = listOf(),
    val users: List<BasicUserDto> = listOf()
)
