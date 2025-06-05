package packit.model.dto

import com.fasterxml.jackson.annotation.JsonAlias

data class DeviceAuthFetchToken (
    @JsonAlias("device_code")
    val deviceCode: String,
    @JsonAlias("grant_type")
    val grantType: String
)