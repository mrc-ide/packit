package packit.model

import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity

class ErrorDetail(private val httpStatus: HttpStatus,
                  val detail: String,
                  val error: String = defaultError)
{

    companion object
    {
        const val defaultError = "OTHER_ERROR"
    }

    fun <T> toResponseEntity() = ResponseEntity
        .status(this.httpStatus)
        .contentType(MediaType.APPLICATION_JSON)
        .body(ErrorResponse(listOf(this)).toJsonString() as T)

    override fun equals(other: Any?): Boolean
    {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ErrorDetail

        if (httpStatus != other.httpStatus) return false
        if (detail != other.detail) return false
        if (error != other.error) return false

        return true
    }

    override fun hashCode(): Int
    {
        var result = httpStatus.hashCode()
        result = 31 * result + detail.hashCode()
        result = 31 * result + error.hashCode()
        return result
    }

    override fun toString(): String
    {
        return "ErrorDetail(httpStatus=$httpStatus, detail='$detail', error='$error')"
    }
}
