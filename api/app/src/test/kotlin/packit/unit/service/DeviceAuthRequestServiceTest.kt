package packit.unit.service


import kotlin.test.assertEquals
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import packit.AppConfig
import packit.service.BaseDeviceAuthRequestService
import java.time.Clock
import java.time.Instant
import java.time.ZoneId
import kotlin.test.Test
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertSame


class DeviceAuthRequestServiceTest {
    val mockAppConfig = mock<AppConfig> {
        on { authDeviceFlowExpirySeconds } doReturn 200
    }

    val fixedClock = Clock.fixed(Instant.now(), ZoneId.of("UTC"))

    @Test
    fun `can issue new device auth request`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        val result = sut.newDeviceAuthRequest()
        assertEquals(fixedClock.instant().plusSeconds(200), result.expiryTime)
        assertEquals(9, result.userCode.value.length)
        assertEquals(86, result.deviceCode.value.length)  // default device code format
    }

    @Test
    fun `can find request`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        val first = sut.newDeviceAuthRequest()
        val second = sut.newDeviceAuthRequest()
        assertNotEquals(first.deviceCode.value, second.deviceCode.value)
        val result = sut.findRequest(second.deviceCode.value)
        assertSame(second, result)
    }

    @Test
    fun `can clean up expired requests`() {
        // mock the clock this time as we want to move it on, which we can't do with a fixedClock
        val mockClock = mock<Clock>()
        var now = Instant.now()

        doAnswer {
            now
        }.`when`(mockClock).instant()
        val sut = BaseDeviceAuthRequestService(mockAppConfig, mockClock)
        val oldRequest = sut.newDeviceAuthRequest()
        assertNotNull(sut.findRequest(oldRequest.deviceCode.value))

        now = now.plusSeconds(201)
        val freshRequest = sut.newDeviceAuthRequest()

        sut.cleanUpExpiredRequests()

        assertNull(sut.findRequest(oldRequest.deviceCode.value))
        assertNotNull(sut.findRequest(freshRequest.deviceCode.value))
    }
}