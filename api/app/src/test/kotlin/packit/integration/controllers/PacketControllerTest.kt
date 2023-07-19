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
                "/packets/file/sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1" +
                        "?filename=report.html",
                String::class.java
            )

        assertHtmlFileSuccess(result)
    }
}
