package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.AppConfig
import packit.exceptions.DeviceAuthTokenException
import packit.model.dto.DeviceAuthDto
import packit.model.dto.DeviceAuthFetchToken
import packit.model.dto.DeviceAuthTokenDto
import packit.security.oauth2.deviceFlow.DeviceAuthRequest
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.DeviceAuthRequestService
import kotlin.time.Duration.Companion.days

@RestController
@RequestMapping("/deviceAuth")
class DeviceAuthController(
    private val appConfig: AppConfig,
    private val deviceAuthRequestService: DeviceAuthRequestService,
    private val jwtIssuer: JwtIssuer
) {

    private val EXPECTED_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code"
    private val expiresIn = appConfig.authExpiryDays.days.inWholeSeconds

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

    @PostMapping("/validate", consumes=["text/plain"])
    fun validateDeviceAuthRequest(
        @RequestBody userCode: String,
        @AuthenticationPrincipal userPrincipal: UserPrincipal
    ): ResponseEntity<Unit> {
        deviceAuthRequestService.validateRequest(userCode, userPrincipal)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/token")
    fun fetchToken(@RequestBody @Validated deviceAuthFetchToken: DeviceAuthFetchToken): ResponseEntity<DeviceAuthTokenDto> {
        if (deviceAuthFetchToken.grantType != EXPECTED_GRANT_TYPE) {
            throw DeviceAuthTokenException("unsupported_grant_type")
        }
        val validatingUser = deviceAuthRequestService.useValidatedRequest(deviceAuthFetchToken.deviceCode)
        val token = jwtIssuer.issue(validatingUser)
        return ResponseEntity.ok(DeviceAuthTokenDto(token, expiresIn))
    }
}