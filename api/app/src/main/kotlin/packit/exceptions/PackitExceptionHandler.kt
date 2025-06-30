package packit.exceptions

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.InternalAuthenticationServiceException
import org.springframework.security.core.AuthenticationException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.servlet.NoHandlerFoundException
import packit.model.DeviceAuthTokenError
import packit.model.ErrorDetail
import packit.service.GenericClientException
import java.util.*

@RestControllerAdvice
class PackitExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException::class)
    fun handleNoHandlerFoundException(e: Exception): Any {
        return ErrorDetail(HttpStatus.NOT_FOUND, e.message ?: "")
            .toResponseEntity()
    }

    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalStateException(e: Exception): Any {
        return ErrorDetail(HttpStatus.INTERNAL_SERVER_ERROR, e.message ?: "")
            .toResponseEntity()
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    fun handleHttpRequestMethodNotSupportedException(e: Exception): Any {
        return ErrorDetail(HttpStatus.METHOD_NOT_ALLOWED, e.message ?: "")
            .toResponseEntity()
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(e: Exception): Any {
        return ErrorDetail(HttpStatus.BAD_REQUEST, e.message ?: "")
            .toResponseEntity()
    }

    @ExceptionHandler(HttpClientErrorException::class, HttpServerErrorException::class)
    fun handleHttpClientErrorException(e: Exception): ResponseEntity<String> {
        val status = when (e) {
            is HttpClientErrorException.Unauthorized -> HttpStatus.UNAUTHORIZED
            is HttpClientErrorException.BadRequest -> HttpStatus.BAD_REQUEST
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }
        return ErrorDetail(status, e.message ?: "")
            .toResponseEntity()
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(e: Exception): ResponseEntity<String> {
        return ErrorDetail(HttpStatus.BAD_REQUEST, e.message ?: "Invalid argument")
            .toResponseEntity()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(e: Exception): ResponseEntity<String> {
        return ErrorDetail(HttpStatus.BAD_REQUEST, e.message ?: "Invalid argument")
            .toResponseEntity()
    }

    @ExceptionHandler(AccessDeniedException::class, AuthenticationException::class)
    fun handleAccessDenied(e: Exception): ResponseEntity<String> {
        return ErrorDetail(HttpStatus.UNAUTHORIZED, e.message ?: "Unauthorized")
            .toResponseEntity()
    }

    @ExceptionHandler(InternalAuthenticationServiceException::class)
    fun handleInternalAuthenticationServiceException(e: Exception): ResponseEntity<String> {
        return ErrorDetail(HttpStatus.UNAUTHORIZED, e.message ?: "Authentication failed")
            .toResponseEntity()
    }

    @ExceptionHandler(GenericClientException::class)
    fun handleGenericClientException(e: GenericClientException): ResponseEntity<String> {
        val clientError = e.cause!! as HttpStatusCodeException
        val message = clientError.responseBodyAsString
        return ResponseEntity<String>(message, clientError.responseHeaders, clientError.statusCode)
    }

    @ExceptionHandler(DeviceAuthTokenException::class)
    fun handleDeviceAuthTokenException(e: DeviceAuthTokenException): ResponseEntity<DeviceAuthTokenError> {
        return ResponseEntity.badRequest().body(DeviceAuthTokenError(e.errorType))
    }

    @ExceptionHandler(PackitException::class)
    fun handlePackitException(
        error: PackitException
    ): ResponseEntity<String> {
        val resourceBundle = getBundle()
        val errorDetail =
            if (resourceBundle.containsKey(error.key)) resourceBundle.getString(error.key) else error.key
        return ErrorDetail(error.httpStatus, errorDetail)
            .toResponseEntity()
    }

    @ExceptionHandler(PackitAuthenticationException::class)
    fun handlePackitAuthenticationException(
        error: PackitAuthenticationException
    ): ResponseEntity<String> {
        return errorDetailForPackitAuthenticationException(error)
            .toResponseEntity()
    }

    fun errorDetailForPackitAuthenticationException(
        error: PackitAuthenticationException
    ): ErrorDetail {
        val resourceBundle = getBundle()

        return ErrorDetail(error.httpStatus, resourceBundle.getString(error.key))
    }

    private fun getBundle(): ResourceBundle {
        return ResourceBundle.getBundle("errorBundle", Locale.ENGLISH)
    }
}
