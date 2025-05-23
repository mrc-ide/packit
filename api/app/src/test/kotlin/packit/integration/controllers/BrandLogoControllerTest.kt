package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Test
import packit.integration.IntegrationTest
import packit.model.dto.LogoDto
import kotlin.test.assertEquals

class BrandLogoControllerTest : IntegrationTest() {
    @Test
    fun `can get config`() {
        val result = restTemplate.getForEntity("/logo/config", String::class.java)

        val body = jacksonObjectMapper().readValue(result.body!!, object : TypeReference<LogoDto>() {})
        assertEquals(body.altText, "Test the logo alt text")
        assertEquals(body.filename, "testTheLogoFileName.png")
        assertEquals(body.linkDestination, "https://www.example.org/test-the-logo-link")

        assertSuccess(result)
    }
}
