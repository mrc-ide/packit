package packit.model.dto

import java.util.*

data class UserWithPermissions(
    val username: String,
    val roles: List<BasicRoleDto> = listOf(),
    val specificPermissions: List<RolePermissionDto> = listOf(),
    val id: UUID,
    val email: String? = null,
    val displayName: String? = null
)
