package packit.integration.exceptionss

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import packit.integration.IntegrationTest
import kotlin.test.assertEquals

class PackitExceptionHandlerTest : IntegrationTest()
{
    @Test
    fun `no route found`()
    {
        val entity = restTemplate.getForEntity("/found/nonsense", String::class.java)

        assertEquals(entity.statusCode, HttpStatus.NOT_FOUND)

        val responseBodyJson = ObjectMapper().readTree(entity.body)

        assertEquals("Not Found", responseBodyJson["error"].asText())

        assertEquals("/found/nonsense", responseBodyJson["path"].asText())
    }

    @Test
    fun `throws exception when packet is not found`()
    {
        val entity = restTemplate.getForEntity("/packets/nonsense", String::class.java)

        assertEquals(entity.statusCode, HttpStatus.INTERNAL_SERVER_ERROR)

        val responseBodyJson = ObjectMapper().readTree(entity.body)

        assertEquals("OTHER_ERROR", responseBodyJson["error"]["error"].asText())

        assertEquals("Packet does not exist", responseBodyJson["error"]["detail"].asText())
    }
}
