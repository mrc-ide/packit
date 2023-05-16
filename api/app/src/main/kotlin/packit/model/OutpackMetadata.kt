package packit.model

data class OutpackMetadata(
        val id: String,
        val name: String,
        val parameters: Map<String, Any>?,
        val custom: Map<String, Any>?
)
