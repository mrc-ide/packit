package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class BasicPacketDto(
    @JsonProperty("name")
    val name: String,
    @JsonProperty("id")
    val id: String,
)
