package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.AppConfig
import packit.controllers.ConfigurationController
import packit.model.dto.LogoDto
import kotlin.test.assertEquals

class ConfigurationControllerTest {
    @Test
    fun `can get config when present`() {
        val mockAppConfig = mock<AppConfig> {
            on { brandLogoAltText } doReturn "This is the logo"
            on { brandLogoFilename } doReturn "our-logo.png"
            on { brandLogoLink } doReturn "https://example.org"
        }

        val sut = ConfigurationController(mockAppConfig)

        val result = sut.getLogo()

        assertEquals(result.statusCode, HttpStatus.OK)

        val expectedConfig = LogoDto(
            altText = "This is the logo",
            filename = "our-logo.png",
            linkDestination = "https://example.org",
        )
        assertEquals(result.body, expectedConfig)
    }

    @Test
    fun `succeeds when no logo config present`() {
        val mockAppConfig = mock<AppConfig>()

        val sut = ConfigurationController(mockAppConfig)

        val result = sut.getLogo()

        assertEquals(result.statusCode, HttpStatus.OK)

        val expectedConfig = LogoDto(
            altText = null,
            filename = null,
            linkDestination = null,
        )
        assertEquals(result.body, expectedConfig)
    }
}
