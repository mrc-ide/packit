package packit.exceptions

import packit.model.DeviceAuthTokenErrorType

class DeviceAuthTokenException(val errorType: DeviceAuthTokenErrorType) : Exception("Device auth error: $errorType")
