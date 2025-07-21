package packit.unit.exceptions

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException
import packit.exceptions.PackitAuthenticationException
import packit.exceptions.PackitException
import packit.exceptions.PackitExceptionHandler
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PackitExceptionHandlerTest {
    @Test
    fun `returns error details for PackitAuthenticationException`() {
        val exception = PackitAuthenticationException("githubTokenInsufficientPermissions")
        val sut = PackitExceptionHandler()
        val result = sut.errorDetailForPackitAuthenticationException(exception)
        assertEquals(
            result.detail,
            "The supplied GitHub token does not have sufficient permissions to check user credentials."
        )
    }

    @Test
    fun `returns error detail from bundle if found for PackitException`() {
        val key = "doesNotExist"
        val exception = PackitException(key, HttpStatus.NOT_FOUND)
        val sut = PackitExceptionHandler()

        val result = sut.handlePackitException(exception)

        assertEquals(
            result.statusCode,
            HttpStatus.NOT_FOUND
        )
        assertEquals(
            jacksonObjectMapper().readTree(result.body).get("error").get("detail").asText(),
            "Resource does not exist"
        )
    }

    @Test
    fun `returns error detail from exception key if not found in bundle for PackitException`() {
        val key = "This key does not exist in error bundle"
        val exception = PackitException(key)
        val sut = PackitExceptionHandler()

        val result = sut.handlePackitException(exception)

        assertEquals(
            jacksonObjectMapper().readTree(result.body).get("error").get("detail").asText(),
            key
        )
    }

    @Test
    fun `returns error detail for fallbackExceptionHandler`() {
        val exception = Exception("This is a fallback exception")
        val sut = PackitExceptionHandler()

        val result = sut.fallbackExceptionHandler(exception)

        assertEquals(
            result.statusCode,
            HttpStatus.INTERNAL_SERVER_ERROR
        )
        assertTrue(
            jacksonObjectMapper().readTree(result.body).get("error").get("detail").asText().contains(
                "An unexpected error occurred. Please contact support with Error ID:"
            )
        )
    }

    @Test
    fun `handleAccessDenied returns PackitException if cause is PackitException`() {
        val cause = PackitException("packetNotFound", HttpStatus.NOT_FOUND)
        val sut = PackitExceptionHandler()

        val result = sut.handleAccessDenied(AccessDeniedException("Access Denied", cause))

        assertEquals(result.statusCode, HttpStatus.NOT_FOUND)
        assertEquals(
            jacksonObjectMapper().readTree(result.body).get("error").get("detail").asText(),
            "Packet not found"
        )
    }

    @Test
    fun `handleAccessDenied returns exception if cause is not PackitException`() {
        val cause = Exception("Some other exception")
        val sut = PackitExceptionHandler()

        val result = sut.handleAccessDenied(AccessDeniedException("Access Denied", cause))

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
        assertEquals(
            jacksonObjectMapper().readTree(result.body).get("error").get("detail").asText(),
            "Access Denied"
        )
    }
}
