package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class OrderlyLocation(
    val type: String,
    val args: Map<String, Any>,
) {
    companion object {
        fun http(url: String): OrderlyLocation {
            return OrderlyLocation(type = "http", args = mapOf("url" to url))
        }
    }
}

data class RunnerSubmitRunInfo(
    val ssh_key: String?,
    @JsonProperty("name")
    val packetGroupName: String,
    val branch: String,
    @JsonProperty("hash")
    val commitHash: String,
    val parameters: Map<String, Any>,
    val location: OrderlyLocation,
)
