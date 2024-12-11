package packit.model.dto

interface PacketGroupDisplay {
    val displayName: String
    val packetDescription: String?
}

data class PacketGroupDisplayImpl(
    override val displayName: String,
    override val packetDescription: String?
) : PacketGroupDisplay
