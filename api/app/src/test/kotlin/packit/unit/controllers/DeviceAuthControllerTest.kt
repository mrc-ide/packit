package packit.unit.controllers

import com.nimbusds.oauth2.sdk.device.DeviceCode
import com.nimbusds.oauth2.sdk.device.UserCode
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.DeviceAuthController
import packit.exceptions.DeviceAuthTokenException
import packit.model.dto.DeviceAuthFetchToken
import packit.security.oauth2.deviceFlow.DeviceAuthRequest
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.DeviceAuthRequestService
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals

class DeviceAuthControllerTest {
    val GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code"
    val testValidatingUser = UserPrincipal("userName", "displayName", mutableListOf(), mutableMapOf())

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
            null
        )
        val mockDevicAuthRequestService = mock<DeviceAuthRequestService> {
            on { newDeviceAuthRequest() } doReturn testDeviceAuthRequest
        }

        val sut = DeviceAuthController(mockAppConfig, mockDevicAuthRequestService, mock())
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
            on { validateRequest(userCode, testValidatingUser) } doReturn true
        }

        val sut  = DeviceAuthController(mock(), mockDeviceAuthRequestService, mock())
        val result = sut.validateDeviceAuthRequest(userCode, testValidatingUser)
        assertEquals(HttpStatus.OK, result.statusCode)
        verify(mockDeviceAuthRequestService).validateRequest(userCode, testValidatingUser)
    }

    @Test
    fun `returns 400 on validated unknown user code`() {
        val userCode = "testUserCode"
        val mockDeviceAuthRequestService = mock<DeviceAuthRequestService> {
            on { validateRequest(userCode, testValidatingUser) } doReturn false
        }

        val sut  = DeviceAuthController(mock(), mockDeviceAuthRequestService, mock())
        val result = sut.validateDeviceAuthRequest(userCode, testValidatingUser)
        assertEquals(HttpStatus.BAD_REQUEST, result.statusCode)
    }

    @Test
    fun `returns access code when device code has been validated`() {
        val deviceCode = "testDeviceCode"
        val testToken = "testAccessToken"
        val mockDeviceAuthRequestService = mock<DeviceAuthRequestService> {
            on { useValidatedRequest(deviceCode) } doReturn testValidatingUser
        }
        val mockJwtIssuer = mock<JwtIssuer> {
            on { issue(testValidatingUser) } doReturn testToken
        }
        val mockAppConfig  = mock<AppConfig> {
            on { authExpiryDays } doReturn 2
        }

        val sut  = DeviceAuthController(mockAppConfig, mockDeviceAuthRequestService, mockJwtIssuer)
        val result = sut.fetchToken(DeviceAuthFetchToken(deviceCode, GRANT_TYPE))
        assertEquals(HttpStatus.OK, result.statusCode)
        val resultBody = result.body
        assertEquals(testToken, resultBody!!.accessToken)
        assertEquals(2 * 24 * 3600, resultBody.expiresIn)
    }

    @Test
    fun `throws exception if wrong grant type`() {
        val sut = DeviceAuthController(mock(), mock(), mock())
        assertThrows<DeviceAuthTokenException> {
            sut.fetchToken(DeviceAuthFetchToken("test code", "bad grant"))
        }.apply {
            assertEquals("unsupported_grant_type", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }
}