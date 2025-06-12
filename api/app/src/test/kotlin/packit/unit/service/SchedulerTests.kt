package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.internal.verification.Times
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import packit.service.DeviceAuthRequestService
import packit.service.OneTimeTokenService
import packit.service.OutpackServerClient
import packit.service.PacketService
import packit.service.Scheduler

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
            mockOneTimeTokenService, mockPacketService, mockOutpackServerClient,
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
}
