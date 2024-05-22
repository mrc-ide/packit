package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class RoleDto(
    @JsonProperty("name")
    var name: String,
    @JsonProperty("rolePermissions")
    var rolePermissions: List<RolePermissionDto> = listOf(),
    @JsonProperty("users")
    var users: List<BasicUserDto> = listOf(),
    @JsonProperty("id")
    var id: Int,
    @JsonProperty("isUsername")
    val isUsername: Boolean
)
