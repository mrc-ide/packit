package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.Mockito.mockStatic
import org.mockito.internal.verification.Times
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import packit.service.*

class SchedulerTests {
    private val mockOneTimeTokenService = mock<OneTimeTokenService>()
    private val mockPacketService = mock<PacketService> {
        on { getChecksum() } doReturn "1"
    }
    private val mockOutpackServerClient = mock<OutpackServerClient> {
        on { getChecksum() } doReturn "2"
    }

    private val mockDeviceAuthRequestService = mock<DeviceAuthRequestService> {}

    private fun getSut(): Scheduler {
        return Scheduler(
            mockOneTimeTokenService,
            mockPacketService,
            mockOutpackServerClient,
            mockDeviceAuthRequestService
        )
    }

    @Test
    fun `imports packets if checksum has changed`() {
        val sut = getSut()
        sut.checkPackets()
        verify(mockPacketService).importPackets()
    }

    @Test
    fun `does not import packets if checksum has not changed`() {
        val mockOutpackServerClient = mock<OutpackServerClient> {
            on { getChecksum() } doReturn "1"
        }
        val sut = getSut()
        verify(mockPacketService, Times(0)).importPackets()
    }

    @Test
    fun `cleans up expired tokens`() {
        val sut = getSut()
        sut.cleanUpExpiredTokens()
        verify(mockOneTimeTokenService).cleanUpExpiredTokens()
    }

    @Test
    fun `cleans up expired device auth requests`() {
        val sut = getSut()
        sut.cleanUpExpiredDeviceAuthRequests()
        verify(mockDeviceAuthRequestService).cleanUpExpiredRequests()
    }

    private fun testUsesAuthorizedSecurityContext(func: () -> Unit) {
        val mockSecurityContext = mock<SecurityContext>()
        mockStatic(SecurityContextHolder::class.java).use { mockSecurityContextHolder ->
            mockSecurityContextHolder.`when`<Any>(SecurityContextHolder::createEmptyContext)
                .thenReturn(mockSecurityContext)

            func()

            verify(mockSecurityContext).authentication = UsernamePasswordAuthenticationToken(
                "system", null,
                listOf(
                    SimpleGrantedAuthority("user.manage"),
                    SimpleGrantedAuthority("packet.manage"),
                    SimpleGrantedAuthority("packet.run"),
                    SimpleGrantedAuthority("outpack.read"),
                    SimpleGrantedAuthority("outpack.write"),
                )
            )
            mockSecurityContextHolder.verify { SecurityContextHolder.setContext(mockSecurityContext) }
            mockSecurityContextHolder.verify { SecurityContextHolder.clearContext() }
        }
    }

    @Test
    fun `uses authorized security context`() {
        val sut = getSut()
        testUsesAuthorizedSecurityContext { sut.checkPackets() }
        testUsesAuthorizedSecurityContext { sut.cleanUpExpiredTokens() }
        testUsesAuthorizedSecurityContext { sut.cleanUpExpiredDeviceAuthRequests() }
    }
}
