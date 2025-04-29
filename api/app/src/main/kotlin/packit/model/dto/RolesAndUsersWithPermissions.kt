package packit.model.dto

data class RolesAndUsersWithPermissions(
    val roles: List<RoleDto> = listOf(),
    val users: List<UserWithPermissions> = listOf()
)
