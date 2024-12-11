package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
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
import packit.model.PacketGroup
import packit.model.dto.PacketGroupDto
import packit.model.toDto
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PacketGroupControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var packetGroupRepository: PacketGroupRepository
    @Autowired
    private lateinit var packetRepository: PacketRepository
    private lateinit var packetGroups: List<PacketGroup>
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
        packetGroups = packetGroupRepository.saveAll(
            packetGroupNames.map { name ->
                PacketGroup(name = name, latestDisplayName = name.replace("-", " "))
            }
        )
    }

    @AfterAll
    fun cleanup()
    {
        packetGroupRepository.deleteAll(packetGroups)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `getPacketGroups returns empty page if no permissions match`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(0, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `return correct page information for get pageable packet groups `()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups?pageNumber=0&pageSize=10&filterName=test-packetGroupName",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
        val resultPage = jacksonObjectMapper().readTree(result.body)
        assertEquals(5, resultPage.get("totalElements").asInt())
        assertEquals(1, resultPage.get("totalPages").asInt())
        assertEquals(0, resultPage.get("number").asInt())
        assertEquals(10, resultPage.get("size").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `getPacketGroups can get second page with correct information`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups?pageNumber=1&pageSize=3&filterName=test-packetGroupName",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertSuccess(result)
        val resultPage = jacksonObjectMapper().readTree(result.body)
        assertEquals(5, resultPage.get("totalElements").asInt())
        assertEquals(2, resultPage.get("totalPages").asInt())
        assertEquals(1, resultPage.get("number").asInt())
        assertEquals(3, resultPage.get("size").asInt())
    }

    @Test
    @WithAuthenticatedUser(
        authorities = [
            "packet.read:packetGroup:test-packetGroupName-1",
            "packet.read:packet:test-packetGroupName-3:20230427-150755-2dbede95"
        ]
    )
    fun `getPacketGroups returns of packet groups user can see`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(2, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `get ordered pageable packetGroups with filtered name`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups?pageNumber=0&pageSize=10&filterName=test-packetGroupName",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
        val resultPacketGroups = jacksonObjectMapper().readTree(result.body).get("content")
            .let {
                jacksonObjectMapper().convertValue(
                    it,
                    object : TypeReference<List<PacketGroupDto>>()
                    {}
                )
            }
        assert(resultPacketGroups.containsAll(packetGroups.map { it.toDto() }))
        assertEquals(5, resultPacketGroups.size)
        assertEquals("test-packetGroupName-1", resultPacketGroups[0].name)
        assertEquals("test-packetGroupName-5", resultPacketGroups[resultPacketGroups.size - 1].name)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:test-packetGroupName-1"])
    fun `getDetail returns correct id, display name and description`()
    {
        val now = Instant.now().epochSecond.toDouble()
        packetRepository.save(
            Packet
                (
                "20241122-111130-544ddd35",
                packetGroupNames[0],
                "",
                mapOf("a" to 1),
                false,
                now,
                now,
                now
            )
        )

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups/${packetGroupNames[0]}/detail",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertSuccess(result)
        val resultBody = jacksonObjectMapper().readTree(result.body)
        assertEquals("20241122-111130-544ddd35", resultBody.get("latestPacketId").asText())
        assertEquals("test packetGroupName 1", resultBody.get("displayName").asText())
        assertTrue(resultBody.get("packetDescription").asText().startsWith("A longer description. Perhaps multiple sentences."))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:wrong-name"])
    fun `getDetail returns 401 if authority is not correct`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups/${packetGroupNames[0]}/detail",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
    }
}
