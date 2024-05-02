package packit.model.dto

data class RoleDto(
    var name: String,
    var rolePermissions: List<RolePermissionDto> = listOf(),
    var usernames: List<UserDto> = listOf(),
    var id: Int
)