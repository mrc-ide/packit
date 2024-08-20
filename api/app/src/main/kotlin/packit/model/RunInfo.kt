package packit.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import packit.model.dto.RunInfoDto
import packit.model.dto.BasicRunInfoDto

@Entity
@Table(name = "`run_info`")
class RunInfo(
    @Id
    var id: String,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "packet_group_name", nullable = false)
    var packetGroup: PacketGroup,

    var status: String? = null,
    var commitHash: String? = null,
    var branch: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    var logs: List<String>? = null,

    var timeStarted: Double? = null,
    var timeCompleted: Double? = null,
    var timeQueued: Double? = null,
    var packetId: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    var parameters: Map<String, Any>? = null
)

fun RunInfo.toDto() = RunInfoDto(
    id, packetGroup.toDto(), status, commitHash, branch, logs,
    timeStarted, timeCompleted, timeQueued, packetId, parameters
)

fun RunInfo.toBasicDto() = BasicRunInfoDto(
    id, packetGroup.toDto(), status, commitHash, branch,
    timeStarted, timeCompleted, timeQueued, packetId, parameters
)
