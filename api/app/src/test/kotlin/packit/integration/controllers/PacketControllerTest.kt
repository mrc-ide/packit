package packit.integration.controllers

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.model.GitMetadata
import packit.model.Packet
import packit.model.PacketMetadata
import packit.model.TimeMetadata
import packit.repository.PacketRepository
import java.time.Instant

class PacketControllerTest : IntegrationTest()
{
    @Autowired
    lateinit var packetRepository: PacketRepository

    val packet = Packet(
        "1", "test", "test name",
        mapOf("name" to "value"), false, Instant.now().epochSecond
    )

    val packetMetadata = PacketMetadata(
        "3",
        "test",
        mapOf("name" to "value"),
        emptyList(),
        GitMetadata("git", "sha", emptyList()),
        TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
        emptyMap(),
    )

    @BeforeEach
    fun `init`()
    {
        packetRepository.save(packet)
    }

    @AfterEach
    fun teardown()
    {
        packetRepository.delete(packet)
    }

    @Test
    fun `can get packets`()
    {
        val result = restTemplate.getForEntity("/packets", String::class.java)
        assertSuccess(result)
    }

    @Test
    fun `get packet metadata by packet id`()
    {
        val result = restTemplate.getForEntity("/packets/metadata/20230427-150755-2dbede93", String::class.java)
        assertSuccess(result)
    }

    @Test
    fun `get packet file by hash`()
    {
        val result = restTemplate
            .getForEntity(
                "/packets/file/sha256:c7b512b2d14a7caae8968830760cb95980a98e18ca2c2991b87c71529e223164",
                String::class.java
            )

        assertFileSuccess(result)
    }
}
