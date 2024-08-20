package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "`run_info`")
class RunInfo(
    @Id
    var taskId: String,

    var status: String? = null,
    var timeStarted: Double? = null,
    var timeCompleted: Double? = null,
    var timeQueued: Double? = null,
    var packetId: String? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "packet_group_name", nullable = false)
    var packetGroup: PacketGroup
)
