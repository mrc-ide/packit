package packit.model.dto

interface PacketIdAndDisplayName {
    val latestPacketId: String
    val displayName: String
}

data class PacketIdAndDisplayNameImpl(
    override val latestPacketId: String,
    override val displayName: String
) : PacketIdAndDisplayName