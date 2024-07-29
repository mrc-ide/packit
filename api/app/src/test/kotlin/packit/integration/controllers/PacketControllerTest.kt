package packit.integration.controllers

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Packet
import packit.repository.PacketRepository
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PacketControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var packetRepository: PacketRepository
    private lateinit var packets: List<Packet>
    private val packetGroupNames = listOf(
        "test-packetGroupName-1",
        "test-packetGroupName-2",
        "test-packetGroupName-3",
        "test-packetGroupName-4",
        "test-packetGroupName-5"
    )

    @BeforeAll
    fun setupData()
    {
        packets = packetRepository.saveAll(
            listOf(
                Packet(
                    "20240729-154633-10abe7d1",
                    packetGroupNames[0],
                    "test-packetGroupName-1",
                    mapOf("name" to "value"),
                    false,
                    0.0,
                    0.0,
                    0.0
                ),
                Packet(
                    "20230427-150755-2dbede94",
                    packetGroupNames[0],
                    packetGroupNames[0],
                    mapOf("a" to 1),
                    false,
                    0.0,
                    0.0,
                    0.0
                ),
                Packet(
                    "20230427-150755-2dbede95",
                    packetGroupNames[2],
                    "test-packetGroupName-3",
                    mapOf("alpha" to true),
                    false,
                    0.0,
                    0.0,
                    0.0
                ),
                Packet(
                    "20230427-150755-2dbede96",
                    packetGroupNames[3],
                    "test-packetGroupName-4",
                    mapOf(),
                    true,
                    0.0,
                    0.0,
                    0.0
                ),
                Packet(
                    "20230427-150755-2dbede97",
                    packetGroupNames[4],
                    "test-packetGroupName-5",
                    mapOf(),
                    true,
                    0.0,
                    0.0,
                    0.0
                ),
            )
        )
    }

    @AfterAll
    fun cleanup()
    {
        packetRepository.deleteAll(packets)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get pageable packets`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets?pageNumber=0&pageSize=5",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    fun `does not get pageable packets when not logged in`()
    {
        val result = restTemplate.getForEntity("/packets?pageNumber=3&pageSize=5", String::class.java)
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `test can get packet group summary if authenticated`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/packetGroupSummary?pageNumber=0&pageSize=5&filterName=hell",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    fun `test can not get packet group summary if not authenticated`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/overview?packetGroupSummary=3&pageSize=5&filterName=hell",
            HttpMethod.GET
        )
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `test can get packets by name if authenticated`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/random?pageNumber=0&pageSize=5",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    fun `test can not get packets by name if notauthenticated`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/random?pageNumber=3&pageSize=5",
            HttpMethod.GET
        )
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get non pageable packets`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `get packet metadata by packet id`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/metadata/20240729-154633-10abe7d1",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `get packet file by hash`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/file/20240729-154633-10abe7d1" +
                    "?hash=sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1" +
                    "&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertHtmlFileSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:test-packetGroupName-1:20240729-154633-10abe7d1"])
    fun `findPacketMetadata returns metadata if user has correct specific permission`()
    {

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/metadata/20240729-154633-10abe7d1",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:name:wrong-id"])
    fun `findPacketMetadata returns 401 if incorrect specific permission`()
    {

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/metadata/20240729-154633-10abe7d1",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:test-packetGroupName-1:20240729-154633-10abe7d1"])
    fun `findFile returns file if user has correct specific permission`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/file/20240729-154633-10abe7d1" +
                    "?hash=sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1" +
                    "&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertHtmlFileSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:wrong-id"])
    fun `findFile returns 401 if incorrect specific permission`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/file/20240729-154633-10abe7d1" +
                    "?hash=sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1" +
                    "&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `pageableIndex returns empty page if no permissions match`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(0, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:test-packetGroupName-1"])
    fun `pageableIndex returns of packets user can see`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(2, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `getPacketsByName returns empty page if no permissions match`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/test-packetGroupName-1",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(0, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:test-packetGroupName-1:20230427-150755-2dbede94"])
    fun `getPacketsByName returns of packets user can see`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/test-packetGroupName-1",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        val packetId = jacksonObjectMapper().readTree(result.body).get("content")[0].get("id").asText()
        assertEquals(1, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
        assertEquals("20230427-150755-2dbede94", packetId)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `getPacketGroupSummary returns empty page if no permissions match`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/packetGroupSummary",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(0, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(
        authorities = [
            "packet.read:packetGroup:test-packetGroupName-1",
            "packet.read:packet:test-packetGroupName-3:20230427-150755-2dbede95"
        ]
    )
    fun `getPacketGroupSummary returns of packet groups user can see`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/packetGroupSummary",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(2, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }
}
