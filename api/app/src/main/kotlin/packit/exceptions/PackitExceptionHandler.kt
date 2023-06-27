package packit.exceptions

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.servlet.NoHandlerFoundException
import packit.model.ErrorDetail
import java.util.*

@ControllerAdvice
class PackitExceptionHandler
{
    @ExceptionHandler(NoHandlerFoundException::class)
    fun handleNoHandlerFoundException(error: Exception): Any
    {
        return handleErrorPage(error)
    }

    @ExceptionHandler(PackitException::class)
    fun handlePackitException(
        error: PackitException
    ): ResponseEntity<String>
    {
        val resourceBundle = getBundle()

        return ErrorDetail(error.httpStatus, resourceBundle.getString(error.key))
            .toResponseEntity()
    }

    private fun handleErrorPage(e: Exception): ResponseEntity<String>
    {
        return unexpectedError(HttpStatus.NOT_FOUND, e.message)
    }

    private fun unexpectedError(
        status: HttpStatus,
        originalMessage: String? = null,
    ): ResponseEntity<String>
    {
        val message = originalMessage ?: ""

        return ErrorDetail(status, message).toResponseEntity()
    }

    private fun getBundle(): ResourceBundle
    {
        return ResourceBundle.getBundle("errorBundle", Locale("en"))
    }
}
