package packit.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.convert.DurationUnit
import java.time.Duration
import java.time.temporal.ChronoUnit

@ConfigurationProperties(prefix = "auth.device-flow")
data class DeviceFlowConfig(
    @DurationUnit(ChronoUnit.SECONDS)
    val expirySeconds: Duration,
    val verificationUri: String
)
