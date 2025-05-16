package packit.integration.controllers

import org.junit.jupiter.api.Test
import packit.integration.IntegrationTest

class ConfigurationControllerTest : IntegrationTest() {
    @Test
    fun `can get config`() {
        val result = restTemplate.getForEntity("/configuration/logo", String::class.java)

        assertSuccess(result)
    }
}
