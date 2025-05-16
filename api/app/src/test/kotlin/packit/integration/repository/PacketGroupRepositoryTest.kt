package packit.integration.repository

import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.WithAuthenticatedUser
import packit.model.Packet
import packit.model.PacketGroup
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import java.time.Instant
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PacketGroupRepositoryTest : RepositoryTest() {
    @Autowired
    lateinit var packetRepository: PacketRepository

    @Autowired
    lateinit var packetGroupRepository: PacketGroupRepository

    val now = Instant.now().epochSecond.toDouble()

    val packets = listOf(
        Packet(
            "20180818-164847-7574833b",
            "incorrect_group",
            "",
            mapOf("a" to 1),
            now,
            now,
            now
        ),
        Packet(
            "20170818-164847-7574853b",
            "correct_group",
            "latest packet in correct group",
            mapOf("a" to 1),
            now - 1,
            now - 1,
            now - 1
        ),
        Packet(
            "20170819-164847-7574823b",
            "correct_group",
            "old packet",
            mapOf("a" to 1),
            now - 2,
            now - 2,
            now - 2
        ),
    )

    val packetGroup = PacketGroup(
        "correct_group",
    )

    @BeforeEach
    override fun setup() {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
    }

    @AfterAll
    fun cleanup() {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:correct_group"])
    fun `can find latest packet id by group name`() {
        packetRepository.saveAll(packets)
        packetGroupRepository.save(packetGroup)

        val result = packetGroupRepository.findLatestPacketIdForGroup("correct_group")

        assertEquals(result?.id, "20170818-164847-7574853b")
    }
}
