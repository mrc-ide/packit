package packit.model.dto

// TODO - check if this file can be deleted

// Projection class for PacketRepository.getFilteredPacketGroupSummaries
interface PacketGroupSummary
{
    fun getName(): String
    fun getPacketCount(): Int
    fun getLatestId(): String
    fun getLatestTime(): Double
    fun getLatestDisplayName(): String
}
