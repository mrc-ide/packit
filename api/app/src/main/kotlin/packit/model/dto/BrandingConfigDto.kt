package packit.model.dto

data class BrandingConfigDto(
    val darkModeEnabled: Boolean,
    val lightModeEnabled: Boolean,
    val logoAltText: String?,
    val logoFilename: String?,
    val logoLinkDestination: String?,
)
