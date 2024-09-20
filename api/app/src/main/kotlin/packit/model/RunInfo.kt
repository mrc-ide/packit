package packit.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import packit.model.dto.BasicRunInfoDto
import packit.model.dto.RunInfoDto
import packit.model.dto.Status

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
    var parameters: Map<String, Any>? = null,

    var queuePosition: Int? = null,

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    var user: User
)

fun RunInfo.toDto() = RunInfoDto(
    taskId, packetGroupName, enumValueOf<Status>(status), commitHash, branch, logs,
    timeStarted, timeCompleted, timeQueued, packetId, parameters, queuePosition, user.displayName ?: user.username
)

fun RunInfo.toBasicDto() = BasicRunInfoDto(
    taskId,
    packetGroupName,
    enumValueOf<Status>(status),
    branch,
    parameters,
    user.displayName ?: user.username,
    commitHash,
    packetId,
    timeQueued
)
