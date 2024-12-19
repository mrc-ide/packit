package packit.model.dto

// Projection class for PacketGroupRepository.getFilteredPacketGroupSummaries
interface PacketGroupSummary
{
    fun getLatestDescription(): String?
    fun getLatestDisplayName(): String
    fun getLatestPacketId(): String
    fun getLatestStartTime(): Double
    fun getName(): String
    fun getPacketCount(): Int
    fun getPacketGroupId(): Int
}

fun PacketGroupSummary.toDisplayDto(): PacketGroupDisplayDto
{
    return PacketGroupDisplayDto(getLatestDisplayName(), getLatestDescription())
}