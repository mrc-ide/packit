package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

class DeviceAuthValidate (
    @JsonProperty("user_code")
    val userCode: String,
)