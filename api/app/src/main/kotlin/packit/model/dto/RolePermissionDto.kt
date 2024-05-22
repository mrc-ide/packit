package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class RolePermissionDto(
    @JsonProperty("permission")
    val permission: String,
    @JsonProperty("packet")
    val packet: BasicPacketDto? = null,
    @JsonProperty("tag")
    val tag: TagDto? = null,
    @JsonProperty("packetGroup")
    val packetGroup: PacketGroupDto? = null,
    @JsonProperty("id")
    val id: Int,
)
