package packit.controllers

import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import packit.AppConfig
import packit.exceptions.DeviceAuthTokenException
import packit.model.dto.DeviceAuthDto
import packit.model.dto.DeviceAuthTokenDto
import packit.model.dto.DeviceAuthValidate
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.DeviceAuthRequestService
import packit.service.UserService
import kotlin.time.Duration.Companion.days

// See docs/auth.md for details on Device Authorization Flow
@RestController
@RequestMapping("/deviceAuth")
class DeviceAuthController(
    private val appConfig: AppConfig,
    private val deviceAuthRequestService: DeviceAuthRequestService,
    private val userService: UserService,
    private val jwtIssuer: JwtIssuer
) {

    private val expectedGrantType = "urn:ietf:params:oauth:grant-type:device_code"
    private val expiresIn = appConfig.authExpiryDays.days.inWholeSeconds

    @PostMapping()
    fun deviceAuthRequest(): ResponseEntity<DeviceAuthDto> {
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
    fun validateDeviceAuthRequest(
        @RequestBody deviceAuthValidate: DeviceAuthValidate,
        @AuthenticationPrincipal userPrincipal: UserPrincipal
    ): ResponseEntity<Unit> {
        val userCode = deviceAuthValidate.userCode
        val user = userService.getByUsername(userPrincipal.name)!!
        deviceAuthRequestService.validateRequest(userCode, user)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/token", consumes = [MediaType.APPLICATION_FORM_URLENCODED_VALUE])
    fun fetchToken(
        @RequestParam("grant_type") grantType: String,
        @RequestParam("device_code") deviceCode: String,
    ): ResponseEntity<DeviceAuthTokenDto> {
        if (grantType != expectedGrantType) {
            throw DeviceAuthTokenException("unsupported_grant_type")
        }
        val validatingUser = deviceAuthRequestService.useValidatedRequest(deviceCode)
        val token = jwtIssuer.issue(validatingUser)
        return ResponseEntity.ok(DeviceAuthTokenDto(token, expiresIn))
    }
}
