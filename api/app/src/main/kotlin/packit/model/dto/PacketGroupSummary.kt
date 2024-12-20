package packit.model.dto

interface PacketGroupSummary
{
    fun getName(): String
    fun getPacketCount(): Int
    fun getLatestId(): String
    fun getLatestTime(): Double
    fun getLatestDisplayName(): String
    fun getLatestDescription(): String?
}