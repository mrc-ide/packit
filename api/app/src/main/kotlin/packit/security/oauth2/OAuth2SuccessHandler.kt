package packit.security.oauth2

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import packit.security.BrowserRedirect
import packit.security.provider.JwtIssuer

@Component
class OAuth2SuccessHandler(
    private val redirect: BrowserRedirect,
    val jwtIssuer: JwtIssuer,
) : SimpleUrlAuthenticationSuccessHandler()
{
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    )
    {
        handle(request, response, authentication)
        super.clearAuthenticationAttributes(request)
    }

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    )
    {
        val token = jwtIssuer.issue(authentication)

        val qs = LinkedMultiValueMap<String, String>().apply{ this.add("token", token) }
        redirect.redirectToBrowser(request, response,qs)
    }
}
