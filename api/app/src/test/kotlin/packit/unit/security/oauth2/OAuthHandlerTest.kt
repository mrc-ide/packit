package packit.unit.security.oauth2

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.BeforeEach
import org.mockito.ArgumentCaptor
import org.mockito.Captor
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.mock
import org.springframework.util.MultiValueMap
import packit.security.BrowserRedirect

open class OAuthHandlerTest {
    @Captor
    protected lateinit var qsCaptor: ArgumentCaptor<MultiValueMap<String, String>>

    protected val mockRedirect = mock<BrowserRedirect>()
    protected val mockRequest = mock<HttpServletRequest>()
    protected val mockResponse = mock<HttpServletResponse>()

    @BeforeEach
    fun setup() {
        // ensure the captor is initialised - we initialise the captor through annotation here as using fromClass cannot
        // be used with generic classes
        MockitoAnnotations.openMocks(this)
    }
}
