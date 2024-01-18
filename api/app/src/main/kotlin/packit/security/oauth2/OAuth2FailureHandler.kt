package packit.security.oauth2

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.util.LinkedMultiValueMap
import packit.exceptions.PackitAuthenticationException
import packit.exceptions.PackitExceptionHandler
import packit.security.BrowserRedirect

class OAuth2FailureHandler(
    private val redirect: BrowserRedirect,
    private val exceptionHandler: PackitExceptionHandler
) : SimpleUrlAuthenticationFailureHandler() {
    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException
    )
    {
        println("EXCEPTION FOR REQUEST ${request.getRequestURL()}")
        println("MESSAGE: ${exception.message}")
        println("HEADERS:")
        val headerNames = request.getHeaderNames()
        if (headerNames != null) {
            for (h in headerNames) {
                println("$h: ${request.getHeader(h)}")
            }
        }

        val message = if (exception is PackitAuthenticationException) {
            exceptionHandler.errorDetailForPackitAuthenticationException(exception).detail
        }
        else {
            exception.message
        }

        val queryString = LinkedMultiValueMap<String, String>().apply{ this.add("error", message) }
        redirect.redirectToBrowser(request, response, queryString)
    }
}
