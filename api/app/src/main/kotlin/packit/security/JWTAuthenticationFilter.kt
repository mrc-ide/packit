package packit.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter
import packit.exceptions.PackitException
import packit.security.ott.OTT_ENDPOINTS_REGEX
import packit.security.profile.TokenToPrincipal
import packit.security.profile.UserPrincipalAuthenticationToken
import packit.security.provider.JwtDecoder
import java.util.*

@Component
class JWTAuthenticationFilter(
    val jwtDecoder: JwtDecoder,
    val jwtToPrincipal: TokenToPrincipal,
) : OncePerRequestFilter()
{
    companion object
    {
        private const val BearerTokenSubString = 7
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    )
    {
        extractToken(request)
            .map(jwtDecoder::decode)
            .map(jwtToPrincipal::convert)
            .map { UserPrincipalAuthenticationToken(it) }
            .ifPresent { authentication ->
                SecurityContextHolder.getContext().authentication = authentication
            }

        filterChain.doFilter(request, response)
    }

    fun extractToken(request: HttpServletRequest): Optional<String>
    {
        val token = request.getHeader("Authorization")
        if (StringUtils.hasText(token))
        {
            if (token.startsWith("Bearer "))
            {
                return Optional.of(token.substring(BearerTokenSubString))
            } else
            {
                throw PackitException("invalidAuthType", HttpStatus.UNAUTHORIZED)
            }
        }
        return Optional.empty()
    }

    override fun shouldNotFilter(request: HttpServletRequest) = request.servletPath.matches(OTT_ENDPOINTS_REGEX)
}
