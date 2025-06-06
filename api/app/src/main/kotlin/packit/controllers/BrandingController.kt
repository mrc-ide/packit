package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.model.dto.BrandingConfigDto

@RestController
@RequestMapping("/branding")
class BrandingController(private val appConfig: AppConfig) {
    @GetMapping("/config")
    fun getConfig(): ResponseEntity<BrandingConfigDto> {
        return ResponseEntity.ok(
            BrandingConfigDto(
                darkModeEnabled = appConfig.darkModeEnabled,
                lightModeEnabled = appConfig.lightModeEnabled,
                logoAltText = appConfig.brandLogoAltText,
                logoFilename = appConfig.brandLogoFilename,
                logoLinkDestination = appConfig.brandLogoLink,
            )
        )
    }
}
