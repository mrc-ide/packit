package packit.unit.exceptions

import org.junit.jupiter.api.Test
import packit.exceptions.PackitAuthenticationException
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
            "The supplied GitHub token is invalid or does not have sufficient permissions to check user credentials."
        )
    }
}
