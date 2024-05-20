package packit.model.dto

import java.util.*

data class UserDto(
    val username: String,
    val roles: List<BasicRoleDto> = listOf(),
    val disabled: Boolean,
    val userSource: String,
    val displayName: String?,
    val email: String?,
    val id: UUID
)
