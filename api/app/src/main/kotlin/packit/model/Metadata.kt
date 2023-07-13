package packit.model

data class Metadata(
    val id: String,
    val name: String,
    val parameters: Map<String, Any>?,
    val files: List<FileMetadata>?,
    val git: GitMetadata?,
    val time: TimeMetadata,
    val custom: Map<String, Any>?
)

data class GitMetadata(
    val branch: String,
    val sha: String,
    val url: List<String>
)

data class TimeMetadata(
    val end: Double,
    val start: Double
)

data class FileMetadata(
    val path: String,
    val size: Number,
    val hash: String,
)
