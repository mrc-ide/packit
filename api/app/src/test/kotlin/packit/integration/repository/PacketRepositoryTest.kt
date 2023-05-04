package packit.integration.repository

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.model.Packet
import packit.repository.PacketRepository
import java.time.Instant
import kotlin.test.assertEquals

class PacketRepositoryTest : RepositoryTest()
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    val now = Instant.now().epochSecond

    val packet = listOf(
            Packet("20180818-164847-7574883b", "test1", "test name1", mapOf("name" to "value"), false, now),
            Packet("20170818-164847-7574883b", "test2", "test name2", mapOf("a" to 1), false, now + 1),
            Packet("20170819-164847-7574883b", "test3", "test name3", mapOf("alpha" to true), false, now),
            Packet("20170819-164847-7574883a", "test4", "test name4", mapOf(), true, now)
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

        assertEquals(result!!.id, "20170818-164847-7574883b")
    }
}
