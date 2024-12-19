package packit.model

import jakarta.persistence.*
import packit.model.dto.BasicPacketDto
import packit.model.dto.PacketDto
import packit.model.dto.PacketGroupDisplayDto
import packit.model.dto.PacketGroupDto

@Entity
@Table(name = "packet_group_display_view")
data class PacketGroupDisplay(
    @Id
    val packetGroupId: Int,

    val name: String,
    val latestDisplayName: String,
    val latestDescription: String?,
    val latestStartTime: Double,
    val packetCount: Int,
    val latestPacketId: String
)

fun PacketGroupDisplay.toDto() = PacketGroupDisplayDto(
    packetGroupId, name, latestDisplayName, latestDescription, latestStartTime, packetCount, latestPacketId
)

//fun Packet.toBasicDto() = BasicPacketDto(name, id)
