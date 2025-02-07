package packit.model

data class PacketMetadata(
    val id: String,
    val name: String,
    val parameters: Map<String, Any>?,
    val files: List<FileMetadata>,
    val git: GitMetadata?,
    val time: TimeMetadata,
    val custom: CustomMetadata,
    val depends: List<DependsMetadata>
)

typealias CustomMetadata = Map<String, Any>?

data class DependsMetadata(
    val packet: String,
    val query: String,
    val files: List<DependsFileMetadata>
)

data class DependsFileMetadata(
    val here: String,
    val there: String
)

data class GitMetadata(
    val branch: String?,
    val sha: String?,
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

data class PageablePayload(val pageNumber: Int = 0, val pageSize: Int = 10)
