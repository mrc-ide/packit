package packit.integration.controllers

import org.junit.jupiter.api.Test
import packit.integration.IntegrationTest

class PacketControllerTest : IntegrationTest()
{
    @Test
    fun `can get packets`()
    {
        val result = restTemplate.getForEntity("/packets", String::class.java)
        assertSuccess(result)
    }
}
