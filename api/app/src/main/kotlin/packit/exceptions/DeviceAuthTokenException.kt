package packit.exceptions

import org.springframework.http.HttpStatus

class DeviceAuthTokenException(val error: String) : PackitException(error, HttpStatus.BAD_REQUEST)
