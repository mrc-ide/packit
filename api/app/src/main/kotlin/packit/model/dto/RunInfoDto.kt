package packit.model.dto

import com.fasterxml.jackson.annotation.JsonValue

enum class Status(@JsonValue val status: String)
{
    PENDING("PENDING"),
    RUNNING("RUNNING"),
    COMPLETE("COMPLETE"),
    ERROR("ERROR"),
    CANCELLED("CANCELLED"),
    DIED("DIED"),
    TIMEOUT("TIMEOUT"),
    MISSING("MISSING"),
    MOVED("MOVED"),
    DEFERRED("DEFERRED"),
    IMPOSSIBLE("IMPOSSIBLE")
}

data class RunInfoDto(
    val taskId: String,
    val packetGroupName: String,
    val status: Status,
    val commitHash: String,
    val branch: String,
    val logs: List<String>? = null,
    val timeStarted: Double? = null,
    val timeCompleted: Double? = null,
    val timeQueued: Double? = null,
    val packetId: String? = null,
    val parameters: Map<String, Any>? = null,
    val queuePosition: Int? = null,
    val runBy: String
)

data class BasicRunInfoDto(
    val taskId: String,
    val packetGroupName: String,
    val status: Status,
    val branch: String,
    val parameters: Map<String, Any>? = null,
    val runBy: String,
    val commitHash: String,
    val packetId: String? = null,
    val timeQueued: Double? = null,
)
