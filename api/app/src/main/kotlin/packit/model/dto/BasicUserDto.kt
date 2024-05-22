package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.util.*

data class BasicUserDto(
    @JsonProperty("username")
    val username: String,
    @JsonProperty("id")
    val id: UUID
)
