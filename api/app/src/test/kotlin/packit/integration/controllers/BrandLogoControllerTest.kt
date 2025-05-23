package packit.integration.controllers

import org.junit.jupiter.api.Test
import packit.integration.IntegrationTest

class BrandLogoControllerTest : IntegrationTest() {
    @Test
    fun `can get config`() {
        val result = restTemplate.getForEntity("/logo/config", String::class.java)

        assertSuccess(result)
    }
}
