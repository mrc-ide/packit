package packit.model.dto

data class PacketDto(
    val id: String,
    val name: String,
    val displayName: String,
    val parameters: Map<String, Any>,
    val published: Boolean,
    val importTime: Double,
    val startTime: Double,
    val endTime: Double,
    val description: String? = null,
)

fun PacketDto.toPacket() = packit.model.Packet(
    id, name, displayName, parameters, published, importTime, startTime, endTime
)
