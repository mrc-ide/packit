package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Test
import packit.integration.IntegrationTest
import packit.model.dto.BrandingConfigDto
import kotlin.test.assertEquals

class BrandingControllerTest : IntegrationTest() {
    @Test
    fun `can get config`() {
        val result = restTemplate.getForEntity("/branding/config", String::class.java)

        val body = jacksonObjectMapper().readValue(result.body!!, object : TypeReference<BrandingConfigDto>() {})
        assertEquals(body.darkModeEnabled, true)
        assertEquals(body.lightModeEnabled, false)
        assertEquals(body.logoAltText, "Test the logo alt text")
        assertEquals(body.logoFilename, "testTheLogoFileName.png")
        assertEquals(body.logoLinkDestination, "https://www.example.org/test-the-logo-link")

        assertSuccess(result)
    }
}
