package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class RunnerPacketGroup(
    val name: String,
    @JsonProperty("updated_time")
    val updatedTime: Long,
    @JsonProperty("has_modifications")
    val hasModifications: Boolean
)
