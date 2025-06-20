package packit.exceptions

import org.springframework.http.HttpStatus

open class PackitException(
    val key: String,
    val httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
) : Exception("PackitException with key $key")
