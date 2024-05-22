package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class TagDto(
    @JsonProperty("name")
    val name: String,
    @JsonProperty("id")
    val id: Int
)
