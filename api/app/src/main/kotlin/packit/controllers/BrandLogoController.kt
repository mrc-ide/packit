package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.model.dto.LogoDto

@RestController
@RequestMapping("/logo")
class BrandLogoController(private val appConfig: AppConfig) {
    @GetMapping("/config")
    fun getConfig(): ResponseEntity<LogoDto> {
        return ResponseEntity.ok(
            LogoDto(
                altText = appConfig.brandLogoAltText,
                filename = appConfig.brandLogoFilename,
                linkDestination = appConfig.brandLogoLink,
            )
        )
    }
}
