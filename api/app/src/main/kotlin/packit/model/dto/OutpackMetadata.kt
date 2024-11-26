package packit.model.dto

import packit.model.TimeMetadata

data class OutpackMetadata(
    val id: String,
    val name: String,
    val parameters: Map<String, Any>?,
    val time: TimeMetadata,
    val custom: Map<String, Any>? = null,
)
