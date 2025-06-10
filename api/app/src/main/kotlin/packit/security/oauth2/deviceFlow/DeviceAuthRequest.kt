package packit.security.oauth2.deviceFlow

import com.nimbusds.oauth2.sdk.device.DeviceCode
import com.nimbusds.oauth2.sdk.device.UserCode
import packit.model.User
import java.time.Instant

// We keep a list of device flow authorization requests in memory so we can validate when a user code is entered
data class DeviceAuthRequest (
    val userCode: UserCode,
    val deviceCode: DeviceCode,
    val expiryTime: Instant,
    var validatedBy: User?
)