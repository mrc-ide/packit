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
}

@Service
class BaseDeviceAuthRequestService(private val appConfig: AppConfig, private val clock: Clock): DeviceAuthRequestService {
    private val requests: MutableList<DeviceAuthRequest> = mutableListOf()

    override fun newDeviceAuthRequest(): DeviceAuthRequest {
        val req = DeviceAuthRequest(
            UserCode(), // defaults to 8 * letter only
            DeviceCode(64),
            clock.instant().plusSeconds(appConfig.authDeviceFlowExpirySeconds)
        )
        requests.add(req)
        return req
    }

    override fun cleanUpExpiredRequests() {
        val now = clock.instant()
        requests.removeAll{ it.expiryTime < now }
    }

    override fun findRequest(deviceCode: String): DeviceAuthRequest? {
        return requests.firstOrNull { it.deviceCode.value == deviceCode }
    }
}