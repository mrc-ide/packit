package packit.exceptions

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.servlet.NoHandlerFoundException
import packit.model.ErrorDetail
import packit.model.ErrorDetail.Companion.defaultError

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
        e: PackitException,
    ): ResponseEntity<String>
    {
        return ErrorDetail(e.httpStatus, e.message ?: "")
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

        return ErrorDetail(status, message, defaultError)
            .toResponseEntity()
    }
}
