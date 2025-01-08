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
    return PacketGroupSummary(
        name = name,
        packetCount = packetCount,
        latestId = id,
        latestTime = time.start,
        latestDisplayName = displayName,
        latestDescription = description
    )
}
