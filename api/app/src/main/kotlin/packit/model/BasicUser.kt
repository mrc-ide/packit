package packit.model

import packit.security.Role

data class BasicUser(
    val userName: String,
    val password: String,
    val displayName: String?,
    val role: List<Role>,
    val attributes: MutableMap<String, Any>
)
