package packit.unit.repository

import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import packit.model.Packet
import packit.repository.PacketRepository
import kotlin.test.assertEquals

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@Transactional
class PacketRepositoryTest
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    val packet = listOf(
            Packet("20180818-164847-7574883b", "test1", "test name1", mapOf("name" to "value"), false),
            Packet("20170818-164847-7574883b", "test2", "test name2", mapOf("a" to 1), false),
            Packet("20170819-164847-7574883b", "test3", "test name3", mapOf("alpha" to true), false),
            Packet("20170819-164847-7574883a", "test4", "test name4", mapOf(), true)
    )

    @Test
    fun `can get packets from db`()
    {
        packetRepository.saveAll(packet)

        val result = packetRepository.findAll()

        assertEquals(result, packet)
    }

    @Test
    fun `can get sorted packet ids from db`()
    {
        packetRepository.saveAll(packet)

        val result = packetRepository.findAllIds()

        assertEquals(
                result,
                listOf(
                        "20170818-164847-7574883b",
                        "20170819-164847-7574883a",
                        "20170819-164847-7574883b",
                        "20180818-164847-7574883b"
                )
        )
    }
}
