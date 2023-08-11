package packit.integration.controllers

import org.junit.jupiter.api.Test
import packit.integration.IntegrationTest

class PacketControllerTest : IntegrationTest()
{

    @Test
    fun `can get pageable packets`()
    {
        val result = restTemplate.getForEntity("/packets?pageNumber=3&pageSize=5", String::class.java)
        assertSuccess(result)
    }

    @Test
    fun `can get non pageable packets`()
    {
        val result = restTemplate.getForEntity("/packets", String::class.java)
        assertSuccess(result)
    }

    @Test
    fun `get packet metadata by packet id`()
    {
        val result = restTemplate.getForEntity("/packets/metadata/20230427-150755-2dbede93", String::class.java)
        assertSuccess(result)
    }

    @Test
    fun `get packet file by hash`()
    {
        val result = restTemplate
            .getForEntity(
                "/packets/file/sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1" +
                        "?filename=report.html",
                String::class.java
            )

        assertHtmlFileSuccess(result)
    }
}
