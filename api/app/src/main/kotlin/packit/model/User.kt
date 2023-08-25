package packit.model

import net.minidev.json.annotate.JsonIgnore
import packit.security.Role

data class User(
    val id: Long,
    val email: String,
    @JsonIgnore
    val password: String,
    val role: Role,
)
