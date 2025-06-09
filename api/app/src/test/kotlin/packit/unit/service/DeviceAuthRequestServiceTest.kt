package packit.unit.service


import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.exceptions.DeviceAuthTokenException
import packit.model.dto.DeviceAuthFetchToken
import packit.security.profile.UserPrincipal
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
    val testValidatingUser1 = UserPrincipal("userName1", "displayName1", mutableListOf(), mutableMapOf())
    val testValidatingUser2 = UserPrincipal("userName2", "displayName2", mutableListOf(), mutableMapOf())


    @Test
    fun `can issue new device auth request`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        val result = sut.newDeviceAuthRequest()
        assertEquals(fixedClock.instant().plusSeconds(200), result.expiryTime)
        assertEquals(9, result.userCode.value.length)
        assertEquals(86, result.deviceCode.value.length)  // default device code format
        assertEquals(null, result.validatedBy)
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

    @Test
    fun `can validate request`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        val request = sut.newDeviceAuthRequest()

        sut.validateRequest(request.userCode.value, testValidatingUser1)
        assertSame(request.validatedBy, testValidatingUser1)
    }

    @Test
    fun `validate expired request throws error and removes from list`() {
        val mockClock = mock<Clock>()
        var now = Instant.now()

        doAnswer {
            now
        }.`when`(mockClock).instant()
        val sut = BaseDeviceAuthRequestService(mockAppConfig, mockClock)
        val request = sut.newDeviceAuthRequest()

        now = now.plusSeconds(201)
        assertThrows<DeviceAuthTokenException> {
            sut.validateRequest(request.userCode.value, testValidatingUser1)
        }.apply {
            assertEquals("token_expired", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
        assertNull(sut.findRequest(request.userCode.value))
    }

    @Test
    fun `validate non-existent request throws error`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        assertThrows<DeviceAuthTokenException> {
            sut.validateRequest("not a code", testValidatingUser1)
        }.apply {
            assertEquals("access_denied", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `validate request which has already been validated throws error`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        val request = sut.newDeviceAuthRequest()
        sut.validateRequest(request.userCode.value, testValidatingUser1)
        assertThrows<DeviceAuthTokenException> {
            sut.validateRequest(request.userCode.value, testValidatingUser1)
        }.apply {
            assertEquals("access_denied", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `can use validated requests`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        val dar1 = sut.newDeviceAuthRequest()
        val dar2 = sut.newDeviceAuthRequest()
        sut.validateRequest(dar2.userCode.value, testValidatingUser2)
        sut.validateRequest(dar1.userCode.value, testValidatingUser1)
        val result1 = sut.useValidatedRequest(dar1.deviceCode.value)
        assertSame(testValidatingUser1, result1)
        val result2 = sut.useValidatedRequest(dar2.deviceCode.value)
        assertSame(testValidatingUser2, result2)

        // Should not be able to use a second time
        assertThrows<DeviceAuthTokenException> {
            sut.useValidatedRequest(dar1.deviceCode.value)
        }.apply {
            assertEquals("access_denied", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }

        assertThrows<DeviceAuthTokenException> {
            sut.useValidatedRequest(dar2.deviceCode.value)
        }.apply {
            assertEquals("access_denied", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `use validated request throws exception if device code does not exist`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        assertThrows<DeviceAuthTokenException> {
            sut.useValidatedRequest("nonexistent code")
        }.apply {
            assertEquals("access_denied", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `use validated request throws exception if device code is expired`() {
        val mockClock = mock<Clock>()
        var now = Instant.now()

        doAnswer {
            now
        }.`when`(mockClock).instant()
        val sut = BaseDeviceAuthRequestService(mockAppConfig, mockClock)
        val request = sut.newDeviceAuthRequest()
        sut.validateRequest(request.userCode.value, testValidatingUser1)

        now = now.plusSeconds(201)
        assertThrows<DeviceAuthTokenException> {
            sut.useValidatedRequest(request.deviceCode.value)
        }.apply {
            assertEquals("expired_token", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `use validated request throws exception if device code is not validated`() {
        val sut = BaseDeviceAuthRequestService(mockAppConfig, fixedClock)
        val request = sut.newDeviceAuthRequest()
        assertThrows<DeviceAuthTokenException> {
            sut.useValidatedRequest(request.deviceCode.value)
        }.apply {
            assertEquals("authorization_pending", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }
}