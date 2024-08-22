package packit.model.dto

data class SubmitRunInfo(
    val name: String,
    val branch: String,
    val hash: String,
    val parameters: Map<String, Any>?
)
