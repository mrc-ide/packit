package packit.unit

import packit.model.Packet
import packit.model.dto.OutpackMetadata
import packit.model.TimeMetadata

fun packetToOutpackMetadata(packet: Packet): OutpackMetadata
{
    return OutpackMetadata(
        packet.id,
        packet.name,
        packet.parameters,
        TimeMetadata(packet.endTime, packet.startTime),
        mapOf(
            "orderly" to mapOf(
                "description" to mapOf(
                    "display" to packet.displayName,
                    "long" to "Description for ${packet.name}"
                )
            )
        )
    )
}