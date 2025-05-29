package packit.model.dto

import com.fasterxml.jackson.annotation.JsonAlias

data class DeviceAuthDto (
    @JsonAlias("device_code")
    val deviceCode: String,
    @JsonAlias("user_code")
    val userCode: String,
    @JsonAlias("verification_uri")
    val verificationUri: String,
    @JsonAlias("expires_in")
    val expiresIn: Long
)