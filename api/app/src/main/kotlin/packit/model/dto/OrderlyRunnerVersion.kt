package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class OrderlyRunnerVersion(
    val orderly: String,
    @JsonProperty("orderly.runner")
    val orderlyRunner: String
)
