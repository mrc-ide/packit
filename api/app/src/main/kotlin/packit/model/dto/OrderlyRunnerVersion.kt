package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class OrderlyRunnerVersion(
    val orderly2: String,
    @JsonProperty("orderly.runner")
    val orderlyRunner: String
)
