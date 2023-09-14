package packit.security.oauth2

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import packit.AppConfig
import packit.security.issuer.JwtIssuer

@Component
class OAuth2SuccessHandler(
    val config: AppConfig,
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
        var targetUrl =
            config.authRedirectUri.ifEmpty { determineTargetUrl(request, response, authentication) }

        val token = jwtIssuer.issue(authentication)

        targetUrl = UriComponentsBuilder
            .fromUriString(targetUrl)
            .queryParam("token", token)
            .build()
            .toUriString()

        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
}
