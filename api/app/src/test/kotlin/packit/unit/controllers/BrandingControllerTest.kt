package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.BrandingController
import packit.model.dto.BrandingConfigDto
import kotlin.test.assertEquals

class BrandingControllerTest {
    @Test
    fun `can get config when present`() {
        val mockAppConfig = mock<AppConfig> {
            on { darkModeEnabled } doReturn false
            on { lightModeEnabled } doReturn true
            on { brandLogoAltText } doReturn "This is the logo"
            on { brandLogoFilename } doReturn "our-logo.png"
            on { brandLogoLink } doReturn "https://example.org"
        }

        val sut = BrandingController(mockAppConfig)

        val result = sut.getConfig()

        assertEquals(result.statusCode, HttpStatus.OK)

        val expectedConfig = BrandingConfigDto(
            darkModeEnabled = false,
            lightModeEnabled = true,
            logoAltText = "This is the logo",
            logoFilename = "our-logo.png",
            logoLinkDestination = "https://example.org",
        )
        assertEquals(result.body, expectedConfig)
    }

    @Test
    fun `succeeds when no logo config present`() {
        val mockAppConfig = mock<AppConfig> {
            on { darkModeEnabled } doReturn true
            on { lightModeEnabled } doReturn false
        }

        val sut = BrandingController(mockAppConfig)

        val result = sut.getConfig()

        assertEquals(result.statusCode, HttpStatus.OK)

        val expectedConfig = BrandingConfigDto(
            darkModeEnabled = true,
            lightModeEnabled = false,
            logoAltText = null,
            logoFilename = null,
            logoLinkDestination = null,
        )
        assertEquals(result.body, expectedConfig)
    }
}
