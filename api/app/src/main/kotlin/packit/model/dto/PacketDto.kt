package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class PacketDto(
    @JsonProperty("id")
    val id: String,
    @JsonProperty("name")
    val name: String,
    @JsonProperty("displayName")
    val displayName: String,
    @JsonProperty("parameters")
    val parameters: Map<String, Any>,
    @JsonProperty("published")
    val published: Boolean,
    @JsonProperty("importTime")
    val importTime: Double,
    @JsonProperty("startTime")
    val startTime: Double,
    @JsonProperty("endTime")
    val endTime: Double,
)

fun PacketDto.toPacket() = packit.model.Packet(
    id, name, displayName, parameters, published, importTime, startTime, endTime
)
