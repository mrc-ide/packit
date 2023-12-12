package packit.model

import packit.security.Role

data class User(
    val userName: String,
    val displayName: String?,
    val role: List<Role>
)
