package packit.integration.controllers
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
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
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import packit.service.PacketService
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PacketControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var packetService: PacketService

    @Autowired
    private lateinit var packetRepository: PacketRepository

    @Autowired
    private lateinit var packetGroupRepository: PacketGroupRepository

    companion object {
        const val idOfArtefactTypesPacket = "20240729-154633-10abe7d1"
        const val idOfComputedResourcePacket = "20240729-154635-88c5c1eb"
        const val hashOfReport = "sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1"
    }

    @BeforeAll
    fun setupData()
    {
        packetService.importPackets()
    }

    @AfterAll
    fun cleanup()
    {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
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
            "/packets/$idOfArtefactTypesPacket",
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
            "/packets/$idOfArtefactTypesPacket/file?hash=$hashOfReport&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertHtmlFileSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:artefact-types:$idOfArtefactTypesPacket"])
    fun `findPacketMetadata returns metadata if user has correct specific permission`()
    {

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket",
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
            "/packets/$idOfArtefactTypesPacket",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:artefact-types:$idOfArtefactTypesPacket"])
    fun `findFile returns file if user has correct specific permission`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket/file?hash=$hashOfReport&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertHtmlFileSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:computed-resource:$idOfComputedResourcePacket"])
    fun `findFile returns 404 if the packet does not contain the file hash`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/file/$idOfComputedResourcePacket?hash=$hashOfReport&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:wrong-id"])
    fun `findFile returns 401 if incorrect specific permission`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket/file?hash=$hashOfReport&filename=report.html",
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
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:artefact-types"])
    fun `pageableIndex returns packets user can see`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        val body = jacksonObjectMapper().readTree(result.body)

        assertThat(body.get("totalElements").intValue()).isGreaterThan(0)
        assertThat(body.get("content")).allSatisfy {
            assertThat(it.get("name").textValue()).isEqualTo("artefact-types")
        }
    }
}
