package packit.model.dto

data class RunInfoDto(
    val taskId: String,
    val packetGroup: PacketGroupDto,
    val status: String? = null,
    val timeStarted: Double? = null,
    val timeCompleted: Double? = null,
    val timeQueued: Double? = null,
    val packetId: String? = null,
    val parameters: Map<String, Any>? = null
)
