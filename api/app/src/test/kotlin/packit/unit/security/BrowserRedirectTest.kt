package packit.unit.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.security.web.RedirectStrategy
import org.springframework.util.LinkedMultiValueMap
import packit.AppConfig
import packit.security.BrowserRedirect

class BrowserRedirectTest {
    @Test
    fun `can redirect with query string`()
    {
        val mockAppConfig = mock<AppConfig> {
            on { authRedirectUri } doReturn "http://localhost:3000/redirect"
        }
        val mockRedirectStrategy = mock<RedirectStrategy>()
        val mockRequest = mock<HttpServletRequest>()
        val mockResponse = mock<HttpServletResponse>()
        val queryParams = LinkedMultiValueMap<String, String>().apply { this.add("token", "1234") }
        val sut = BrowserRedirect(mockAppConfig, mockRedirectStrategy)
        sut.redirectToBrowser(mockRequest, mockResponse, queryParams)
        verify(mockRedirectStrategy).sendRedirect(
            mockRequest,
            mockResponse,
            "http://localhost:3000/redirect?token=1234"
        )
    }
}
