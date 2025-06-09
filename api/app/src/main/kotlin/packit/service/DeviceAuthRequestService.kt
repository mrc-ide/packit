package packit.service

import com.nimbusds.oauth2.sdk.device.DeviceCode
import com.nimbusds.oauth2.sdk.device.UserCode
import org.springframework.stereotype.Service
import packit.AppConfig
import packit.exceptions.DeviceAuthTokenException
import packit.security.oauth2.deviceFlow.DeviceAuthRequest
import packit.security.profile.UserPrincipal
import java.time.Clock

interface DeviceAuthRequestService {
    fun newDeviceAuthRequest(): DeviceAuthRequest
    fun cleanUpExpiredRequests()
    fun findRequest(deviceCode: String): DeviceAuthRequest?
    fun validateRequest(userCode: String, userPrincipal: UserPrincipal): Unit
    fun useValidatedRequest(deviceCode: String): UserPrincipal
}

@Service
class BaseDeviceAuthRequestService(private val appConfig: AppConfig, private val clock: Clock): DeviceAuthRequestService {
    private val requests: MutableList<DeviceAuthRequest> = mutableListOf()

    override fun newDeviceAuthRequest(): DeviceAuthRequest {
        val req = DeviceAuthRequest(
            UserCode(), // defaults to 8 * letter only
            DeviceCode(64),
            clock.instant().plusSeconds(appConfig.authDeviceFlowExpirySeconds),
            null
        )
        requests.add(req)
        return req
    }

    override fun cleanUpExpiredRequests() {
        requests.removeAll{ isExpired(it) }
    }

    // TODO: this may become obsolete eventually - or maybe not - this should find the device request and let the
    // controller issue the token.. if validated is true..
    override fun findRequest(deviceCode: String): DeviceAuthRequest? {
        return requests.firstOrNull { it.deviceCode.value == deviceCode }
    }

    override fun validateRequest(userCode: String, userPrincipal: UserPrincipal) {
        // Mark a request as validated by a given user. Return error if request not found, or already validated
        val request = requests.firstOrNull { it.userCode.value == userCode }
        if (request == null || request.validatedBy != null) {
            throw DeviceAuthTokenException("access_denied")
        }
        // remove request from list if it is expired
        if (isExpired(request)) {
            removeRequest(request)
            throw DeviceAuthTokenException("expired_token")
        }
        request.validatedBy = userPrincipal
    }

    override fun useValidatedRequest(deviceCode: String): UserPrincipal {
        // Find a validated request identified by the given device code, remove it from the list and
        // return the validating user so the controller can issue their access token
        // Throw 400 if not found, not validated or expired
        val request = requests.firstOrNull { it.deviceCode.value == deviceCode }
        if (request == null) {
            throw DeviceAuthTokenException("access_denied")
        }
        if (isExpired(request)) {
            removeRequest(request)
            throw DeviceAuthTokenException("expired_token")
        }
        if (request.validatedBy == null) {
            throw DeviceAuthTokenException("authorization_pending")
        }
        removeRequest(request)
        return request.validatedBy!!
    }

    private fun removeRequest(request: DeviceAuthRequest) {
        requests.remove(request)
    }

    private fun isExpired(request: DeviceAuthRequest): Boolean  = request.expiryTime < clock.instant()
}