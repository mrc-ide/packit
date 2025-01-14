package packit.model.dto

data class PacketGroupSummary(
    val name: String,
    val packetCount: Int,
    val latestId: String,
    val latestTime: Double,
    val latestDisplayName: String,
)
