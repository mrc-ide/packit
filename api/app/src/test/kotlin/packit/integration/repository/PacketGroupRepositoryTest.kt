package packit.integration.repository

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.WithAuthenticatedUser
import packit.model.Packet
import packit.model.PacketGroup
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import java.time.Instant
import kotlin.test.assertEquals

class PacketGroupRepositoryTest : RepositoryTest()
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    @Autowired
    lateinit var packetGroupRepository: PacketGroupRepository

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
            now,
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
            "test3",
            "test name3",
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
            (now + 5),
            "A description"
        ),
    )

    val packetGroups = listOf(
        PacketGroup("test1"),
        PacketGroup("test2"),
        PacketGroup("test3"),
        PacketGroup("test4")
    )

    @BeforeEach
    override fun setup()
    {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
        packetRepository.saveAll(packets)
        packetGroupRepository.saveAll(packetGroups)
    }


    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get right order and data expected from getFilteredPacketGroupSummaries`() {
        val result = packetGroupRepository.getFilteredPacketGroupSummaries("").map {
            object {
                val name = it.getName()
                val latestStartTime = it.getLatestStartTime()
                val latestPacketId = it.getLatestPacketId()
                val latestDisplayName = it.getLatestDisplayName()
                val packetCount = it.getPacketCount()
                val latestDescription = it.getLatestDescription()
            }
        }
        assertEquals(result.size, 4)
        assertEquals(result[0].name, "test1")
        assertEquals(result[0].latestPacketId, "20170819-164847-7574333b")
        assertEquals(result[0].latestStartTime, now + 5)
        assertEquals(result[0].latestDisplayName, "test name1")
        assertEquals(result[0].packetCount, 2)
        assertEquals(result[0].latestDescription, "A description")
        assertEquals(result[1].name, "test4")
        assertEquals(result[2].name, "test3")
        assertEquals(result[3].name, "test2")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can filter correctly when calling getFilteredPacketGroupSummaries with part of a packet group name`() {
        val result = packetGroupRepository.getFilteredPacketGroupSummaries("est4")

        assertEquals(result.size, 1)
        assertEquals(result[0].getName(), "test4")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can filter correctly when calling getFilteredPacketGroupSummaries with part of a packet display name`() {
        val result = packetGroupRepository.getFilteredPacketGroupSummaries("name3")

        assertEquals(result.size, 1)
        assertEquals(result[0].getName(), "test3")
    }
}
