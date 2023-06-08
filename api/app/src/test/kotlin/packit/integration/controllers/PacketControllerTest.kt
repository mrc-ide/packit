package packit.integration.controllers

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertFalse
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

    @Test
    fun `get packet by packet id`()
    {
        val packets = restTemplate.getForEntity("/packets", String::class.java)

        val objectMapper = ObjectMapper()

        val jsonNode: JsonNode = objectMapper.readTree(packets.body)

        assertFalse(jsonNode.isEmpty)

        val id = jsonNode[0].get("id")

        val result = restTemplate.getForEntity("/packets/$id", String::class.java)

        assertSuccess(result)
    }
}
