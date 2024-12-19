package packit.integration.repository

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.AccessDeniedException
import packit.integration.WithAuthenticatedUser
import packit.model.Packet
import packit.model.PacketGroup
import packit.repository.PacketGroupDisplayRepository
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import packit.repository.findAllBySearchFilter
import java.time.Instant
import kotlin.test.assertEquals

class PacketGroupDisplayRepositoryTest : RepositoryTest() {
    @Autowired
    lateinit var packetGroupDisplayRepository: PacketGroupDisplayRepository

    @Autowired
    lateinit var packetRepository: PacketRepository

    @Autowired
    lateinit var packetGroupRepository: PacketGroupRepository

    val now = Instant.now().epochSecond.toDouble()

    val test1latestPacketId = "20170819-164847-7574333b"
    val test4latestPacketId = "20170819-164847-7574113a"
    val test3PacketId = "20170819-164847-7574823b"
    val test2PacketId = "20170818-164847-7574853b"
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
            test2PacketId,
            "test2",
            "test name2",
            mapOf("a" to 1),
            false,
            now + 1,
            (now + 1),
            (now + 1)
        ),
        Packet(
            test3PacketId,
            "test3",
            "test name3",
            mapOf("alpha" to true),
            false,
            now + 3,
            (now + 3),
            (now + 3)
        ),
        Packet(
            test4latestPacketId,
            "test4",
            "test name4",
            mapOf(),
            true,
            now + 4,
            (now + 4),
            (now + 4),
            "The latest test4 packet's description"
        ),
        Packet(
            "20170819-164847-7574983b",
            "test4",
            "test name4",
            mapOf(),
            true,
            now + 2,
            (now + 2),
            (now + 2),
            "The outdated test4 packet description"
        ),
        Packet(
            test1latestPacketId,
            "test1",
            "test name1",
            mapOf(),
            true,
            now + 5,
            (now + 5),
            (now + 5)
        ),
    )

    // Listing these in the order they are expected to be returned: descending latest start time.
    val packetGroups = listOf(
        PacketGroup("test1"),
        PacketGroup("test4"),
        PacketGroup("test3"),
        PacketGroup("test2")
    )

    @BeforeEach
    override fun setup() {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
        packetRepository.saveAll(packets)
        packetGroupRepository.saveAll(packetGroups)
    }

    @Test
    fun `can get packet group displays from db, with correct properties, and can use ViewRepository functions`() {
        assertEquals(packetGroupDisplayRepository.count(), 4)

        val result = packetGroupDisplayRepository.findAll()

        // Test the ordering alongside testing the properties.
        for (i in packetGroups.indices) {
            assertEquals(result[i].name, packetGroups[i].name)
            assertEquals(result[i].packetGroupId, packetGroups[i].id)
        }

        val test1 = result.find { it.name == "test1" }!!
        val test2 = result.find { it.name == "test2" }!!
        val test3 = result.find { it.name == "test3" }!!
        val test4 = result.find { it.name == "test4" }!!

        assertEquals(test1.latestDisplayName, "test name1")
        assertEquals(test2.latestDisplayName, "test name2")
        assertEquals(test3.latestDisplayName, "test name3")
        assertEquals(test4.latestDisplayName, "test name4")

        assertEquals(test1.latestDescription, null)
        assertEquals(test2.latestDescription, null)
        assertEquals(test3.latestDescription, null)
        assertEquals(test4.latestDescription, "The latest test4 packet's description")

        assertEquals(test1.latestStartTime, now + 5)
        assertEquals(test2.latestStartTime, now + 1)
        assertEquals(test3.latestStartTime, now + 3)
        assertEquals(test4.latestStartTime, now + 4)

        assertEquals(test1.packetCount, 2)
        assertEquals(test2.packetCount, 1)
        assertEquals(test3.packetCount, 1)
        assertEquals(test4.packetCount, 2)

        assertEquals(test1.latestPacketId, test1latestPacketId)
        assertEquals(test2.latestPacketId, test2PacketId)
        assertEquals(test3.latestPacketId, test3PacketId)
        assertEquals(test4.latestPacketId, test4latestPacketId)

        val test1id = test1.packetGroupId
        assertEquals(packetGroupDisplayRepository.existsById(test1id), true)
        assertEquals(packetGroupDisplayRepository.findById(test1id)!!.get().name, "test1")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:test1"])
    fun `can find correct packet group display by name`() {
        val result = packetGroupDisplayRepository.findByName("test1")!!

        assertEquals(result.name, "test1")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:unauthorised_packet_group_name"])
    fun `findByName throws an Access Denied exception when incorrectly authorised`() {
        assertThrows<AccessDeniedException> {
            packetGroupDisplayRepository.findByName("test1")
        }
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `findAllBySearchFilter gets all packet group displays whose name contains x`() {
        val result = packetGroupDisplayRepository.findAllBySearchFilter("est")

        assertEquals(result.size, 4)

        val result2 = packetGroupDisplayRepository.findAllBySearchFilter("3")

        assertEquals(result2.size, 1)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `findAllBySearchFilter gets all packet group displays whose latest display name contains x`() {
        val result = packetGroupDisplayRepository.findAllBySearchFilter("name")

        assertEquals(result.size, 4)

        val result2 = packetGroupDisplayRepository.findAllBySearchFilter("4")

        assertEquals(result2.size, 1)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:test1"])
    fun `findAllBySearchFilter throws Access Denied exception when incorrectly authorised`() {
        assertThrows<AccessDeniedException> {
            packetGroupDisplayRepository.findAllBySearchFilter("est")
        }
    }
}
