package packit.model

import java.io.Serializable

data class OutpackResponse<T>(
        val status: String,
        val data: T,
        val errors: Any?
) : Serializable
