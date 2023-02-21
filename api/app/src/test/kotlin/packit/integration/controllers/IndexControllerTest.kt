package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import packit.integration.IntegrationTest

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IndexControllerTest: IntegrationTest()
{
    @Test
    fun `can get packet`()
    {
        val result = restTemplate.getForEntity("/packet", String::class.java)
        assertSuccess(result)
    }
}