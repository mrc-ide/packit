package packit.model.dto

data class BasicRunInfoDto(
    val taskId: String,
    val packetGroupName: String,
    val status: String? = null,
    val commitHash: String,
    val branch: String,
    val timeStarted: Double? = null,
    val timeCompleted: Double? = null,
    val timeQueued: Double? = null,
    val packetId: String? = null,
    val parameters: Map<String, Any>? = null
)
