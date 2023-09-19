package packit.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter
import packit.exceptions.PackitException
import packit.security.issuer.JwtDecoder
import packit.security.profile.TokenToPrincipal
import packit.security.profile.UserPrincipalAuthenticationToken
import java.util.Optional

@Component
class TokenAuthenticationFilter(
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
                throw PackitException("Invalid authorization type. Please use a Bearer token.")
            }
        }
        return Optional.empty()
    }
}
