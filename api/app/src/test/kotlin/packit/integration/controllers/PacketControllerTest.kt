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
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.PacketGroup
import packit.model.dto.PacketGroupDto
import packit.model.toDto
import packit.repository.PacketGroupRepository
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PacketControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var packetGroupRepository: PacketGroupRepository
    private lateinit var packetGroups: List<PacketGroup>

    @BeforeAll
    fun setupData()
    {
        packetGroups = packetGroupRepository.saveAll(
            listOf(
                PacketGroup(name = "test-packetGroup-2"),
                PacketGroup(name = "test-packetGroup-1"),
                PacketGroup(name = "test-packetGroup-5"),
                PacketGroup(name = "test-packetGroup-4"),
                PacketGroup(name = "test-packetGroup-3"),
            )
        )
    }

    @AfterAll
    fun cleanup()
    {
        packetGroupRepository.deleteAll(packetGroups)
    }

    @Test
    @WithAuthenticatedUser
    fun `can get pageable packets`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets?pageNumber=3&pageSize=5",
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
    @WithAuthenticatedUser
    fun `test can get packet group summary if authenticated`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/packetGroupSummary?pageNumber=3&pageSize=5&filterName=hell",
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
    @WithAuthenticatedUser
    fun `test can get packets by name if authenticated`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/random?pageNumber=3&pageSize=5",
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
    @WithAuthenticatedUser
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
    @WithAuthenticatedUser
    fun `get packet metadata by packet id`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/metadata/20230427-150755-2dbede93",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser
    fun `get packet file by hash`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/file/sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1" +
                    "?filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertHtmlFileSuccess(result)
    }

    @Test
    @WithAuthenticatedUser
    fun `get ordered pageable packetGroups with filtered name`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/packetGroup?pageNumber=0&pageSize=10&filterName=test-packetGroup",
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
        assertEquals("test-packetGroup-1", resultPacketGroups[0].name)
        assertEquals("test-packetGroup-5", resultPacketGroups[resultPacketGroups.size - 1].name)
    }

    @Test
    @WithAuthenticatedUser
    fun `return correct page information for get pageable packet groups `()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/packetGroup?pageNumber=0&pageSize=10&filterName=test-packetGroup",
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
}
