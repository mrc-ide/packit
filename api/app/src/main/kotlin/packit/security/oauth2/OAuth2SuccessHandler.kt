package packit.security.oauth2

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import packit.security.BrowserRedirect
import packit.security.profile.PackitOAuth2User
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
        val user = authentication.principal as PackitOAuth2User
        val token = jwtIssuer.issue(user.principal)

        val queryString = LinkedMultiValueMap<String, String>().apply { this.add("token", token) }
        redirect.redirectToBrowser(request, response, queryString)
    }
}
