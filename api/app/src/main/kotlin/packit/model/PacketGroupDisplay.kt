package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "packet_group_display_view")
data class PacketGroupDisplay(
    @Id
    val name: String,

    val packetGroupId: Int,
    val latestDisplayName: String,
    val latestDescription: String?,
    val latestStartTime: Double,
    val packetCount: Int,
    val latestPacketId: String
)
