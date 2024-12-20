package packit.model.dto

import packit.model.CustomMetadata
import packit.model.TimeMetadata

data class OutpackMetadata(
    val id: String,
    val name: String,
    val parameters: Map<String, Any>?,
    val time: TimeMetadata,
    val custom: CustomMetadata = null,
)

fun OutpackMetadata.toPacketGroupSummary(
    packetCount: Int, displayName: String, description: String?
): PacketGroupSummary
{
    return object : PacketGroupSummary {
        override fun getName(): String = name
        override fun getPacketCount(): Int = packetCount
        override fun getLatestId(): String = id
        override fun getLatestTime(): Double = time.start
        override fun getLatestDisplayName(): String = displayName
        override fun getLatestDescription(): String? = description
    }
}
