package packit.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import packit.model.dto.BasicRunInfoDto
import packit.model.dto.RunInfoDto

@Entity
@Table(name = "`run_info`")
class RunInfo(
    @Id
    var taskId: String,

    var packetGroupName: String,
    var status: String,
    var commitHash: String,
    var branch: String,

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
    taskId, packetGroupName, status, commitHash, branch, logs,
    timeStarted, timeCompleted, timeQueued, packetId, parameters
)

fun RunInfo.toBasicDto() = BasicRunInfoDto(
    taskId, packetGroupName, status, commitHash, branch,
    timeStarted, timeCompleted, timeQueued, packetId, parameters
)
