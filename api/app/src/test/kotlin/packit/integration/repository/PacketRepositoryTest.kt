package packit.integration.repository

import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext
import packit.model.Packet
import packit.repository.PacketRepository
import java.time.Instant
import kotlin.test.assertEquals

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@Transactional
class PacketRepositoryTest
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    val packet = listOf(
            Packet(
                    "1", "test1", "test name1",
                    mapOf("name" to "value"), false, Instant.now().epochSecond
            ),
            Packet(
                    "2", "test2", "test name2",
                    mapOf("name2" to "value2"), false, Instant.now().epochSecond + 1
            )
    )

    @Test
    fun `most recent packet is null if no packets in db`()
    {
        val result = packetRepository.findMostRecent()
        assertEquals(result, null)
    }

    @Test
    fun `can get most recent packet from db`()
    {
        packetRepository.saveAll(packet)
        val result = packetRepository.findMostRecent()
        assertEquals(result!!.name, "test2")
    }
}
