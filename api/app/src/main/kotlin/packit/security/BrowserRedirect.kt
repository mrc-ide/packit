package packit.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.web.RedirectStrategy
import org.springframework.stereotype.Component
import org.springframework.util.MultiValueMap
import org.springframework.web.util.UriComponentsBuilder
import packit.AppConfig

@Component
class BrowserRedirect(private val config: AppConfig, val redirectStrategy: RedirectStrategy) {
    fun redirectToBrowser(
        request: HttpServletRequest,
        response: HttpServletResponse,
        queryParams: MultiValueMap<String, String>
    ) {
        val url = UriComponentsBuilder
            .fromUriString(config.authRedirectUri)
            .queryParams(queryParams)
            .build()
            .toUriString()
        redirectStrategy.sendRedirect(request, response, url)
    }
}
