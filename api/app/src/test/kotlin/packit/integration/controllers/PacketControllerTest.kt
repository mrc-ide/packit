package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.model.Packet
import packit.repository.PacketRepository
import java.time.Instant
import kotlin.test.assertEquals

class PacketControllerTest : IntegrationTest()
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    val packet = Packet(
        "1", "test", "test name",
        mapOf("name" to "value"), false, Instant.now().epochSecond
    )

    @BeforeEach
    fun `init`()
    {

        packetRepository.save(packet)
    }
    @Test
    fun `can get packets`()
    {
        val result = restTemplate.getForEntity("/packets", String::class.java)
        assertSuccess(result)
    }

    @Test
    fun `get packet by packet id`()
    {
        val result = restTemplate.getForEntity("/packets/1", String::class.java)

        val objectMapper = ObjectMapper()

        val response = objectMapper.readValue(result.body, Packet::class.java)

        assertEquals(response, packet)

        assertSuccess(result)
    }
}
