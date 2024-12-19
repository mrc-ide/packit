package packit.model.dto

data class PacketGroupDisplayDto(
    val packetGroupId: Int,
    val name: String,
    val latestDisplayName: String,
    val latestDescription: String?,
    val latestStartTime: Double,
    val packetCount: Int,
    val latestPacketId: String
)