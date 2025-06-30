package packit.model

import com.fasterxml.jackson.annotation.JsonValue

enum class DeviceAuthTokenErrorType(@JsonValue val status: String) {
    ACCESS_DENIED("access_denied"),
    AUTHORIZATION_PENDING("authorization_pending"),
    EXPIRED_TOKEN("expired_token"),
    UNSUPPORTED_GRANT_TYPE("unsupported_grant_type")
}

data class DeviceAuthTokenError(val error: DeviceAuthTokenErrorType)
