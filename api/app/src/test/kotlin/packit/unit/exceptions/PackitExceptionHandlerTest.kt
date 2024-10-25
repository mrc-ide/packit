package packit.unit.exceptions

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import packit.exceptions.PackitAuthenticationException
import packit.exceptions.PackitException
import packit.exceptions.PackitExceptionHandler
import kotlin.test.assertEquals

class PackitExceptionHandlerTest
{
    @Test
    fun `returns error details for PackitAuthenticationException`()
    {
        val exception = PackitAuthenticationException("githubTokenInsufficientPermissions")
        val sut = PackitExceptionHandler()
        val result = sut.errorDetailForPackitAuthenticationException(exception)
        assertEquals(
            result.detail,
            "The supplied GitHub token does not have sufficient permissions to check user credentials."
        )
    }

    @Test
    fun `returns error detail from bundle if found for PackitException`()
    {
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
    fun `returns error detail from exception key if not found in bundle for PackitException`()
    {
        val key = "This key does not exist in error bundle"
        val exception = PackitException(key)
        val sut = PackitExceptionHandler()

        val result = sut.handlePackitException(exception)

        assertEquals(
            jacksonObjectMapper().readTree(result.body).get("error").get("detail").asText(),
            key
        )
    }
}
