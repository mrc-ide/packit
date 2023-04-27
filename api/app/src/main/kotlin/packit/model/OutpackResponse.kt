package packit.model

import java.io.Serializable

data class OutpackResponse (
    val status: String,
    val data: Any?,
    val errors: Any?
): Serializable
