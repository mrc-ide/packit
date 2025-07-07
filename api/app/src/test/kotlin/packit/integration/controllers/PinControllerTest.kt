package packit.integration.controllers

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Pin
import packit.model.dto.PinDto
import packit.repository.PinRepository
import packit.service.PacketService
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PinControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var packetService: PacketService

    @Autowired
    private lateinit var pinRepository: PinRepository

    private val pinnedPacketIds = listOf(
        "20241122-111130-544ddd35",
        "20240729-154633-10abe7d1",
        "20240729-154657-76529696",
    )

    private val unpinnedPacketId = "20240729-155506-6ed557a1"

    @BeforeAll
    fun setupData() {
        packetService.importPackets()
    }

    @BeforeEach
    fun resetData() {
        pinRepository.deleteAll()
        pinnedPacketIds.forEach { pinRepository.save(Pin(packetId = it)) }
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `getPinnedPackets should return sorted packet metadata`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        val body = jacksonObjectMapper().readTree(result.body)
        assertThat(body.size()).isEqualTo(3)
        assertThat(body[0].get("id").textValue()).isEqualTo(pinnedPacketIds[0])
        assertThat(body[1].get("id").textValue()).isEqualTo(pinnedPacketIds[2])
        assertThat(body[2].get("id").textValue()).isEqualTo(pinnedPacketIds[1])
    }

    @Test
    fun `getPinnedPackets returns error when not authenticated`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins/packets",
            HttpMethod.GET,
        )
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:test1:20240729-154657-76529696"])
    fun `getPinnedPackets returns partial list if permissions partially overlap with pinned packets`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        val body = jacksonObjectMapper().readTree(result.body)
        assertThat(body.size()).isEqualTo(1)
        assertThat(body[0].get("id").textValue()).isEqualTo(pinnedPacketIds[2])
    }

    @Test
    fun `pinPacket returns error when not authenticated`() {
        val result: ResponseEntity<String> = restTemplate.exchange("/pins", HttpMethod.POST)
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["wrong-permission"])
    fun `pinPacket returns error when user does not have permission`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins",
            HttpMethod.POST,
            getTokenizedHttpEntity(data = PinDto(packetId = unpinnedPacketId))
        )
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.manage"])
    fun `pinPacket creates a pin by packet id and returns the packet id`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins",
            HttpMethod.POST,
            getTokenizedHttpEntity(data = PinDto(packetId = unpinnedPacketId))
        )
        assertThat(result.statusCode).isEqualTo(HttpStatus.CREATED)
        assertEquals(MediaType.APPLICATION_JSON, result.headers.contentType)

        val body = jacksonObjectMapper().readTree(result.body)
        assertThat(body.get("packetId").textValue()).isEqualTo(unpinnedPacketId)
        assertThat(pinRepository.findByPacketId(unpinnedPacketId)).isNotNull
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.manage"])
    fun `pinPacket returns a 'bad request' response if it already exists for some packet id`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins",
            HttpMethod.POST,
            getTokenizedHttpEntity(data = PinDto(packetId = pinnedPacketIds[0]))
        )
        assertBadRequest(result)

        val body = jacksonObjectMapper().readTree(result.body)
        assertThat(body.get("error").get("detail").textValue()).isEqualTo("Pin already exists")
        assertThat(pinRepository.findAll()).hasSize(3)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.manage"])
    fun `pinPacket returns a 'not found' response if no packet with packet id exists`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins",
            HttpMethod.POST,
            getTokenizedHttpEntity(data = PinDto(packetId = "non-existent-packet-id"))
        )

        assertNotFound(result)
        val body = jacksonObjectMapper().readTree(result.body)
        assertThat(body.get("error").get("detail").textValue()).isEqualTo("Packet not found")
        assertThat(pinRepository.findAll()).hasSize(3)
    }
}
