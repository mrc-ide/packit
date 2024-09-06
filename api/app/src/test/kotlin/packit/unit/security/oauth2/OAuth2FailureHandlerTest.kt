package packit.unit.security.oauth2

import org.mockito.kotlin.*
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import packit.exceptions.PackitAuthenticationException
import packit.exceptions.PackitExceptionHandler
import packit.security.oauth2.OAuth2FailureHandler
import kotlin.test.Test
import kotlin.test.assertEquals

class OAuth2FailureHandlerTest : OAuthHandlerTest() {
    fun assertExpectedRedirectOnException(exception: AuthenticationException, expectedError: String)
    {
        val sut = OAuth2FailureHandler(mockRedirect, PackitExceptionHandler())
        sut.onAuthenticationFailure(mockRequest, mockResponse, exception)

        verify(mockRedirect).redirectToBrowser(eq(mockRequest), eq(mockResponse), capture(qsCaptor))
        assertEquals((qsCaptor.value["error"]?.get(0) ?: ""), expectedError)
    }

    @Test
    fun `can redirect on PackitAuthenticationException`()
    {
        assertExpectedRedirectOnException(
            PackitAuthenticationException("githubTokenInsufficientPermissions"),
            "The supplied GitHub token does not have sufficient permissions to check user credentials."
        )
    }

    @Test
    fun `can redirect on other exception`()
    {
        val e = OAuth2AuthenticationException(OAuth2Error("invalid_token"), "test error")
        assertExpectedRedirectOnException(e, "test error")
    }
}
