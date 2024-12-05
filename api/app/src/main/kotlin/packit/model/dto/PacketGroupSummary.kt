package packit.model.dto

// Projection class for PacketRepository.findPacketGroupSummaryByName
interface PacketGroupSummary
{
    fun getName(): String
    fun getPacketCount(): Int
    fun getLatestId(): String
    fun getLatestTime(): Double
    fun getLatestDisplayName(): String
}
