package packit.unit.repository

import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import packit.model.Packet
import packit.repository.PacketRepository
import kotlin.test.assertEquals

@DataJpaTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@Transactional
class PacketRepositoryTest
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    val packet = listOf(
        Packet("1", "test1", "test name1", mapOf("name" to "value"), false),
        Packet("2", "test2", "test name2", mapOf("name2" to "value2"), false)
    )

    @Test
    fun `can get packets from db`()
    {
        packetRepository.saveAll(packet)

        val result = packetRepository.findAll()

        assertEquals(result, packet)
    }

}

