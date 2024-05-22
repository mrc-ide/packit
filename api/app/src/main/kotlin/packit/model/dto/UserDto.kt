package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.util.*

data class UserDto(
    @JsonProperty("username")
    val username: String,
    @JsonProperty("roles")
    val roles: List<BasicRoleDto> = listOf(),
    @JsonProperty("disabled")
    val disabled: Boolean,
    @JsonProperty("userSource")
    val userSource: String,
    @JsonProperty("displayName")
    val displayName: String?,
    @JsonProperty("email")
    val email: String?,
    @JsonProperty("id")
    val id: UUID
)
