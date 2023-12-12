package packit.integration.controllers

import org.junit.jupiter.api.Test
import packit.integration.IntegrationTest

class LoginControllerTest : IntegrationTest()
{
    @Test
    fun `can get config`()
    {
        val result = restTemplate.getForEntity("/auth/config", String::class.java)

        assertSuccess(result)
    }
}
