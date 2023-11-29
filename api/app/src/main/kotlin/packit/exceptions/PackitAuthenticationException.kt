package packit.exceptions

import org.springframework.http.HttpStatus
import org.springframework.security.core.AuthenticationException

class PackitAuthenticationException(
    val key: String,
    val httpStatus: HttpStatus = HttpStatus.UNAUTHORIZED
) : AuthenticationException("PackitAuthenticationException with key $key")
