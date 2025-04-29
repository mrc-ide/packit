package packit.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import packit.security.ott.OTTAuthenticationFilter

/**
 * This filter is used to choose between the JWT and OTT (one-time tokens) authentication filters, based on the request
 * path.
 */
@Component
class AuthStrategySwitch(
    private val jwtAuthenticationFilter: JWTAuthenticationFilter,
    private val ottAuthenticationFilter: OTTAuthenticationFilter,
) : OncePerRequestFilter()
{
    // A matcher for /packets/{id}/file and /packets/{id}/files/zip
    val ottEndpointsRegex = Regex("/packets/[^/]+/(file|files/zip)")

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        if (request.servletPath.matches(ottEndpointsRegex))
        {
            ottAuthenticationFilter.doFilter(request, response, filterChain)
        } else {
            jwtAuthenticationFilter.doFilter(request, response, filterChain)
        }
    }
} 
