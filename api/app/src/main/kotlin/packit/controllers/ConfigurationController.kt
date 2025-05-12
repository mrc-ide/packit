package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.model.dto.LogoDto

@RestController
@RequestMapping("/configuration")
class ConfigurationController(private val appConfig: AppConfig)
{
    @GetMapping("/logo")
    fun getLogo(): ResponseEntity<LogoDto>
    {
        return ResponseEntity.ok(
            LogoDto(
                altText = appConfig.brandLogoAltText,
                filename = appConfig.brandLogoFilename,
                linkDestination = appConfig.brandLogoLink,
            )
        )
    }
}
