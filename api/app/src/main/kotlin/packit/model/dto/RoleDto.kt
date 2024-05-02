package packit.model.dto

data class RoleDto(
    var name: String,
    var rolePermissions: List<RolePermissionDto> = listOf(),
    var users: List<UserDto> = listOf(),
    var id: Int
)