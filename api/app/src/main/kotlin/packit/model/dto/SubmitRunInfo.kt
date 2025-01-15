package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class SubmitRunInfo(
    @JsonProperty("name")
    val packetGroupName: String,
    val branch: String,
    @JsonProperty("hash")
    val commitHash: String,
    val parameters: Map<String, Any>
)
