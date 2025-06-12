package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class DeviceAuthDto(
    @JsonProperty("device_code")
    val deviceCode: String,
    @JsonProperty("user_code")
    val userCode: String,
    @JsonProperty("verification_uri")
    val verificationUri: String,
    @JsonProperty("expires_in")
    val expiresIn: Long
)
