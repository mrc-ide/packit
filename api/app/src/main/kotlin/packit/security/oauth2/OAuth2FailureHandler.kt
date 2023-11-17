package packit.security.oauth2;

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.util.LinkedMultiValueMap
import packit.security.BrowserRedirect

class OAuth2FailureHandler(private val redirect: BrowserRedirect) : SimpleUrlAuthenticationFailureHandler() {
    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException
    ) {
        // TODO: log exception
        val qs = LinkedMultiValueMap<String, String>().apply{ this.add("error", exception.message) }
        redirect.redirectToBrowser(request, response,qs)
    }
}
