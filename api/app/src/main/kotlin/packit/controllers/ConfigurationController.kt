package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.model.dto.BrandingDto

@RestController
@RequestMapping("/configuration")
class ConfigurationController(private val appConfig: AppConfig)
{
    @GetMapping("/branding")
    fun getBranding(): ResponseEntity<BrandingDto>
    {
        return ResponseEntity.ok(BrandingDto(
            brandName = appConfig.brandName,
            logoAltText = appConfig.brandLogoAltText,
            logoLink = appConfig.brandLogoLink,
            logoName = appConfig.brandLogoName,
        ))
    }
}
