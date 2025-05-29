package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.AppConfig
import packit.model.dto.DeviceAuthDto
import packit.service.DeviceAuthRequestService

@RestController
@RequestMapping("/deviceAuth")
class DeviceAuthController(
    private val appConfig: AppConfig,
    private val deviceAuthRequestService: DeviceAuthRequestService
) {
    // TODO: link to spec
    // TODO: note somewhere - keeping this at a different base root from main "auth" just to keep it separate, but open to argument!
    // TODO: note somewhere - seems odd for POST w no body, but that's what spec seems to suggest
    @PostMapping()
    fun deviceAuthRequest(): ResponseEntity<DeviceAuthDto> {
        // TODO: note role of each request including this one
        val deviceAuthRequest = deviceAuthRequestService.newDeviceAuthRequest()
        val response = DeviceAuthDto(
            deviceAuthRequest.deviceCode.value,
            deviceAuthRequest.userCode.value,
            appConfig.authDeviceFlowVerificationUri,
            appConfig.authDeviceFlowExpirySeconds
        )
        return ResponseEntity.ok(response)
    }

    @PostMapping("/validate")
    fun validateDeviceAuthRequest(@RequestBody userCode: String): ResponseEntity<Unit> {
        return if (deviceAuthRequestService.validateRequest(userCode)) {
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.badRequest().build()
        }
    }
}