package packit.model

data class PacketMetadata(
    val custom: Map<String, Any>?,
    val files: List<File>?,
    val git: Git?,
    val id: String,
    val name: String,
    val parameters: Map<String, Any>?,
    val time: Time,
)

data class Git(
    val branch: String,
    val sha: String,
    val url: List<String>
)

data class Time(
    val end: Double,
    val start: Double
)

data class File(
    val path: String,
    val size: Number,
    val hash: String,
)
