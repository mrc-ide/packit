package packit.unit.controllers

import com.nimbusds.oauth2.sdk.device.DeviceCode
import com.nimbusds.oauth2.sdk.device.UserCode
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.DeviceAuthController
import packit.security.oauth2.deviceFlow.DeviceAuthRequest
import packit.service.DeviceAuthRequestService
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals

class DeviceAuthControllerTest {
    @Test
    fun `can request device flow`() {
        val mockAppConfig  = mock<AppConfig> {
            on { authDeviceFlowExpirySeconds } doReturn 100
            on { authDeviceFlowVerificationUri } doReturn "http://example.com/device"
        }

        val testDeviceAuthRequest = DeviceAuthRequest(
            UserCode("testUserCode"),
            DeviceCode("testDeviceCode"),
            Instant.now(),
            false
        )
        val mockDevicAuthRequestService = mock<DeviceAuthRequestService> {
            on { newDeviceAuthRequest() } doReturn testDeviceAuthRequest
        }

        val sut = DeviceAuthController(mockAppConfig, mockDevicAuthRequestService)
        val result = sut.deviceAuthRequest()
        assertEquals(HttpStatus.OK, result.statusCode)
        val resultBody = result.body
        assertEquals("testDeviceCode", resultBody!!.deviceCode)
        assertEquals("testUserCode", resultBody.userCode)
        assertEquals("http://example.com/device", resultBody.verificationUri)
        assertEquals(100, resultBody.expiresIn)
    }

    @Test
    fun `returns 200 on validate known user code`() {
        val userCode = "testUserCode"
        val mockDeviceAuthRequestService = mock<DeviceAuthRequestService> {
            on { validateRequest(userCode) } doReturn true
        }

        val sut  = DeviceAuthController(mock(), mockDeviceAuthRequestService)
        val result = sut.validateDeviceAuthRequest(userCode)
        assertEquals(HttpStatus.OK, result.statusCode)
        verify(mockDeviceAuthRequestService).validateRequest(userCode)
    }

    @Test
    fun `returns 400 on validated unknown user code`() {
        val userCode = "testUserCode"
        val mockDeviceAuthRequestService = mock<DeviceAuthRequestService> {
            on { validateRequest(userCode) } doReturn false
        }

        val sut  = DeviceAuthController(mock(), mockDeviceAuthRequestService)
        val result = sut.validateDeviceAuthRequest(userCode)
        assertEquals(HttpStatus.BAD_REQUEST, result.statusCode)
    }
}