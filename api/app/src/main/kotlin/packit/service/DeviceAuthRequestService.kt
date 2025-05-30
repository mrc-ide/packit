package packit.service

import com.nimbusds.oauth2.sdk.device.DeviceCode
import com.nimbusds.oauth2.sdk.device.UserCode
import org.springframework.stereotype.Service
import packit.AppConfig
import packit.security.oauth2.deviceFlow.DeviceAuthRequest
import java.time.Clock

interface DeviceAuthRequestService {
    fun newDeviceAuthRequest(): DeviceAuthRequest
    fun cleanUpExpiredRequests()
    fun findRequest(deviceCode: String): DeviceAuthRequest?
    fun validateRequest(userCode: String): Boolean
}

@Service
class BaseDeviceAuthRequestService(private val appConfig: AppConfig, private val clock: Clock): DeviceAuthRequestService {
    private val requests: MutableList<DeviceAuthRequest> = mutableListOf()

    override fun newDeviceAuthRequest(): DeviceAuthRequest {
        val req = DeviceAuthRequest(
            UserCode(), // defaults to 8 * letter only
            DeviceCode(64),
            clock.instant().plusSeconds(appConfig.authDeviceFlowExpirySeconds),
            false
        )
        requests.add(req)
        return req
    }

    override fun cleanUpExpiredRequests() {
        val now = clock.instant()
        requests.removeAll{ it.expiryTime < now }
    }

    // TODO: this may become obsolete eventually - or maybe not - this should find the device request and let the
    // controller issue the token.. if validated is true..
    override fun findRequest(deviceCode: String): DeviceAuthRequest? {
        return requests.firstOrNull { it.deviceCode.value == deviceCode }
    }

    override fun validateRequest(userCode: String): Boolean {
        val request = requests.firstOrNull { it.userCode.value == userCode }
        if (request == null) {
            return false
        }
        // remove request from list if it is expired
        if (request.expiryTime < clock.instant()) {
            requests.remove(request)
            return false
        }
        request.validated = true
        return true
    }
}