package packit.model

import net.minidev.json.annotate.JsonIgnore
import packit.security.Role

data class User(
    val userName: String,
    val displayName: String?,
    val role: List<Role>
)
