package packit.service

import com.nimbusds.oauth2.sdk.device.DeviceCode
import com.nimbusds.oauth2.sdk.device.UserCode
import org.springframework.stereotype.Service
import packit.AppConfig
import packit.security.oauth2.deviceFlow.DeviceAuthRequest
import java.time.Instant

interface DeviceAuthRequestService {
    fun newDeviceAuthRequest(): DeviceAuthRequest
    fun cleanUpExpiredRequests()
}

@Service
class BaseDeviceAuthRequestService(private val appConfig: AppConfig): DeviceAuthRequestService {
    private val requests: MutableList<DeviceAuthRequest> = mutableListOf()

    override fun newDeviceAuthRequest(): DeviceAuthRequest {
        val req = DeviceAuthRequest(
            UserCode(), // defaults to 8 * letter only
            DeviceCode(64),
            Instant.now().plusSeconds(appConfig.authDeviceFlowExpirySeconds)
        )
        requests.add(req)
        return req
    }

    override fun cleanUpExpiredRequests() {
        val now = Instant.now()
        requests.removeAll{ it.expiryTime > now }
    }
}