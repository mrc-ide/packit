package packit.model.dto

data class TaskStatus(
    val timeQueued: Double,
    val timeStarted: Double?,
    val timeComplete: Double?,
    val queuePosition: Int?,
    val logs: List<String>?,
    val status: String,
    val packetId: String?
)
