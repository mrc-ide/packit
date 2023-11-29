package packit.unit.security.oauth2

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.BeforeEach
import org.mockito.ArgumentCaptor
import org.mockito.Captor
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.*
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.util.MultiValueMap
import packit.exceptions.PackitAuthenticationException
import packit.exceptions.PackitExceptionHandler
import packit.security.BrowserRedirect
import packit.security.oauth2.OAuth2FailureHandler
import kotlin.test.Test

class OAuth2FailureHandlerTest {
    private val mockRedirect = mock<BrowserRedirect>()
    private val mockRequest = mock<HttpServletRequest>()
    private val mockResponse = mock<HttpServletResponse>()

    @Captor
    private lateinit var qsCaptor: ArgumentCaptor<MultiValueMap<String, String>>

    @BeforeEach
    fun setup()
    {
        // ensure the captor is initialised
        MockitoAnnotations.openMocks(this)
    }

    fun assertExpectedRedirectOnException(exception: AuthenticationException, expectedError: String)
    {
        val sut = OAuth2FailureHandler(mockRedirect, PackitExceptionHandler())
        sut.onAuthenticationFailure(mockRequest, mockResponse, exception)

        verify(mockRedirect).redirectToBrowser(eq(mockRequest), eq(mockResponse), capture(qsCaptor))
        assert((qsCaptor.value["error"]?.get(0) ?: "") == expectedError)

    }

    @Test
    fun `can redirect on PackitAuthenticationException`()
    {
        assertExpectedRedirectOnException(PackitAuthenticationException("githubTokenInsufficientPermissions"),
            "The supplied GitHub token is invalid or does not have sufficient permissions to check user credentials.")
    }

    @Test
    fun `can redirect on other exception`()
    {
        val e = OAuth2AuthenticationException(OAuth2Error("invalid_token"), "test error")
        assertExpectedRedirectOnException(e, "test error")
    }
}