package packit.unit.security.ott

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.security.core.context.SecurityContextHolder
import packit.exceptions.PackitException
import packit.model.OneTimeToken
import packit.repository.OneTimeTokenRepository
import packit.security.ott.OTTAuthenticationFilter
import packit.security.ott.OTTAuthenticationToken
import packit.service.OneTimeTokenService
import java.time.Instant
import java.util.UUID

class OTTAuthenticationFilterTest {
    private val oneTimeTokenRepository: OneTimeTokenRepository = mock()
    private val oneTimeTokenService: OneTimeTokenService = mock()
    private val filter = OTTAuthenticationFilter(oneTimeTokenRepository, oneTimeTokenService)
    private val packetId = "packetId"

    @Test
    fun `deletes token after successful authentication`() {
        val tokenId = UUID.randomUUID()
        val packet = mock<packit.model.Packet> { on { id } doReturn packetId }
        val filePaths = listOf("file1.txt")
        val expiresAt = Instant.now().plusSeconds(60)
        val oneTimeToken = OneTimeToken(tokenId, packet, filePaths, expiresAt)
        whenever(oneTimeTokenService.getToken(tokenId)).thenReturn(oneTimeToken)

        val request: HttpServletRequest = mock {
            on { getParameter("token") } doReturn tokenId.toString()
            on { servletPath } doReturn "/packets/$packetId/file"
        }
        val response: HttpServletResponse = mock()
        val filterChain: FilterChain = mock()

        filter.doFilter(request, response, filterChain)

        val securityContext = SecurityContextHolder.getContext()
        val authentication = securityContext.authentication as OTTAuthenticationToken

        verify(oneTimeTokenRepository).deleteById(tokenId)
        verify(filterChain).doFilter(request, response)
        assert(authentication.principal == tokenId)
        assert(authentication.getPermittedPacketId() == packetId)
        assert(authentication.getPermittedFilePaths() == filePaths)
        assert(authentication.getExpiresAt() == expiresAt)
        assert(authentication.isAuthenticated)
    }

    @Test
    fun `throws exception if token id is not provided`() {
        val request: HttpServletRequest = mock {
            on { getParameter("token") } doReturn null
            on { servletPath } doReturn "/packets/$packetId/file"
        }
        val response: HttpServletResponse = mock()
        val filterChain: FilterChain = mock()

        val exception = assertThrows<PackitException> {
            filter.doFilter(request, response, filterChain)
        }

        assert(exception.key == "tokenNotProvided")
        verifyNoInteractions(oneTimeTokenRepository)
    }
}
