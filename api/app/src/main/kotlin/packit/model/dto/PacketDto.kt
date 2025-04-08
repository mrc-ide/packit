package packit.model.dto

data class PacketDto(
    val id: String,
    val name: String,
    val displayName: String,
    val parameters: Map<String, Any>,
    val importTime: Double,
    val startTime: Double,
    val endTime: Double,
)

fun PacketDto.toPacket() = packit.model.Packet(
    id, name, displayName, parameters, importTime, startTime, endTime
)
