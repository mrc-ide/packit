package packit.security.ott

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.context.SecurityContextHolderStrategy
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.model.OneTimeToken
import packit.repository.OneTimeTokenRepository
import packit.service.OneTimeTokenService
import java.util.UUID

@Component
class OTTAuthenticationFilter(
    private val oneTimeTokenRepository: OneTimeTokenRepository,
    private val oneTimeTokenService: OneTimeTokenService,
)
{
    private val securityContextRepository: SecurityContextRepository = HttpSessionSecurityContextRepository()
    // To avoid race conditions. See https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html#use-securitycontextholderstrategy
    private val securityContextHolderStrategy: SecurityContextHolderStrategy =
        SecurityContextHolder.getContextHolderStrategy()

    fun doFilter(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val ottId = request.getParameter("token")
        if (ottId.isNullOrBlank()) {
            throw PackitException("tokenNotProvided", HttpStatus.UNAUTHORIZED)
        }
        val ott = oneTimeTokenService.getToken(UUID.fromString(ottId))

        updateSecurityContext(ott, request, response)

        oneTimeTokenRepository.deleteById(ott.id)
        filterChain.doFilter(request, response)
    }

    /**
     * Create a new Authentication instance containing our custom details, and set it in the SecurityContext.
     * Somewhat modelled after https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html#store-authentication-manually
     */
    private fun updateSecurityContext(
        ott: OneTimeToken,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
        val context: SecurityContext = securityContextHolderStrategy.createEmptyContext()
        val auth = OTTAuthenticationToken(ott.id, ott.packet.id, ott.filePaths, ott.expiresAt)
        auth.isAuthenticated = true
        context.authentication = auth
        securityContextHolderStrategy.context = context
        securityContextRepository.saveContext(context, request, response)
    }
}
