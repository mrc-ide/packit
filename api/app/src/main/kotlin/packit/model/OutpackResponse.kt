package packit.model

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.Serializable

data class OutpackResponse<T>(
        val status: String,
        val data: T,
        val errors: Any?
) : Serializable

data class ErrorResponse(val errors: List<ErrorDetail>)
{
        val data = mapOf<Any, Any>()
        val status = "failure"
}

fun ErrorResponse.toJsonString() = ObjectMapper().apply {
        setSerializationInclusion(JsonInclude.Include.NON_NULL)
}.writeValueAsString(this)
