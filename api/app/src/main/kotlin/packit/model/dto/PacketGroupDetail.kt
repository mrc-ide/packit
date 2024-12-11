package packit.model.dto

interface PacketGroupDetail {
    val latestPacketId: String
    val displayName: String
    val packetDescription: String?
}

data class PacketGroupDetailImpl(
    override val latestPacketId: String,
    override val displayName: String,
    override val packetDescription: String?
) : PacketGroupDetail
