package packit.model

// Projection class for PacketRepository.findPacketGroupSummaryByName
interface PacketGroupSummary
{
    fun getName(): String
    fun getPacketCount(): Int

    fun getLatestId(): String
    fun getLatestTime(): Long

}

