package packit.integration.repository

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import packit.integration.WithAuthenticatedUser
import packit.model.Packet
import packit.repository.PacketRepository
import java.time.Instant
import kotlin.test.assertEquals

class PacketRepositoryTest : RepositoryTest()
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    val now = Instant.now().epochSecond.toDouble()

    val packets = listOf(
        Packet(
            "20180818-164847-7574833b",
            "test1",
            "test name1",
            mapOf("name" to "value"),
            false,
            now,
            now,
            now
        ),
        Packet(
            "20170818-164847-7574853b",
            "test2",
            "test name2",
            mapOf("a" to 1),
            false,
            now + 1,
            (now + 1),
            (now + 1)
        ),
        Packet(
            "20170819-164847-7574823b",
            "random",
            "random",
            mapOf("alpha" to true),
            false,
            now + 3,
            (now + 3),
            (now + 3)
        ),
        Packet(
            "20170819-164847-7574113a",
            "test4",
            "test name4",
            mapOf(),
            true,
            now + 4,
            (now + 4),
            (now + 4)
        ),
        Packet(
            "20170819-164847-7574983b",
            "test4",
            "test name4",
            mapOf(),
            true,
            now + 2,
            (now + 2),
            (now + 2)
        ),
        Packet(
            "20170819-164847-7574333b",
            "test1",
            "test name1",
            mapOf(),
            true,
            now + 5,
            (now + 5),
            (now + 5)
        ),
    )

    @BeforeEach
    override fun setup()
    {
        packetRepository.deleteAll()
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get packets from db`()
    {
        packetRepository.saveAll(packets)

        val result = packetRepository.findAll()

        for (i in packets.indices)
        {
            assertEquals(result[i].id, packets[i].id)
            assertEquals(result[i].name, packets[i].name)
            assertEquals(result[i].importTime, packets[i].importTime)
            assertEquals(result[i].displayName, packets[i].displayName)
        }
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `gets filtered by name packets when findByName called`()
    {
        packetRepository.saveAll(packets)

        val result = packetRepository.findByName("test1", Sort.by("startTime").descending())

        assertEquals(result.size, 2)
        assertEquals(result[0].name, "test1")
        assertEquals(result[1].name, "test1")
        assertEquals(result[0].id, "20180818-164847-7574833b")
        assertEquals(result[1].id, "20170819-164847-7574333b")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])

    fun `can get right order and data expected from findPacketGroupSummaryByName`()
    {
        packetRepository.saveAll(packets)

        val result = packetRepository.findPacketGroupSummaryByName("").map {
            object
            {
                val name = it.getName()
                val latestTime = it.getLatestTime()
                val latestId = it.getLatestId()
                val packetCount = it.getPacketCount()
            }
        }
        assertEquals(result.size, 4)
        assertEquals(result[0].name, "test1")
        assertEquals(result[0].latestId, "20170819-164847-7574333b")
        assertEquals(result[0].latestTime, now + 5)
        assertEquals(result[0].packetCount, 2)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can filter correctly when calling findPacketGroupSummaryByName`()
    {
        packetRepository.saveAll(packets)

        val result = packetRepository.findPacketGroupSummaryByName("4").map {
            object
            {
                val name = it.getName()
                val latestTime = it.getLatestTime()
                val latestId = it.getLatestId()
                val packetCount = it.getPacketCount()
            }
        }

        assertEquals(result.size, 1)
        assertEquals(result[0].name, "test4")
        assertEquals(result[0].latestId, "20170819-164847-7574113a")
        assertEquals(result[0].latestTime, now + 4)
        assertEquals(result[0].packetCount, 2)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get sorted packet ids from db`()
    {
        packetRepository.saveAll(packets)

        val result = packetRepository.findAllIds()

        assertEquals(
            result,
            listOf(
                "20170818-164847-7574853b",
                "20170819-164847-7574113a",
                "20170819-164847-7574333b",
                "20170819-164847-7574823b",
                "20170819-164847-7574983b",
                "20180818-164847-7574833b"
            )
        )
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `most recent packet is null if no packets in db`()
    {
        val result = packetRepository.findTopByOrderByImportTimeDesc()
        assertEquals(result, null)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get most recent packet from db`()
    {
        packetRepository.saveAll(packets)

        val result = packetRepository.findTopByOrderByImportTimeDesc()

        assertEquals(result!!.id, "20170819-164847-7574333b")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get packet by id`()
    {
        packetRepository.saveAll(packets)

        val result = packetRepository.findById(packets[0].id)

        val id = result.orElseGet(null).id

        assertEquals(id, "20180818-164847-7574833b")
    }
}
