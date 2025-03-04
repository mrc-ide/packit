package packit.integration.controllers

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
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
import packit.model.Pin
import packit.repository.PinRepository
import packit.service.PacketService

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PinControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var packetService: PacketService

    @Autowired
    private lateinit var pinRepository: PinRepository

    private val packetIds = listOf(
        "20241122-111130-544ddd35",
        "20240729-154633-10abe7d1",
        "20240729-154657-76529696",
    )

    @BeforeAll
    fun setupData() {
        packetService.importPackets()
        pinRepository.deleteAll()
        packetIds.forEach { pinRepository.save(Pin(packetId = it)) }
    }

    @Test
    @WithAuthenticatedUser(authorities = [])
    fun `getPinnedPackets should return sorted packet metadata`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/pins/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        val body = jacksonObjectMapper().readTree(result.body)
        assertThat(body.size()).isEqualTo(3)
        assertThat(body[0].get("id").textValue()).isEqualTo(packetIds[0])
        assertThat(body[1].get("id").textValue()).isEqualTo(packetIds[2])
        assertThat(body[2].get("id").textValue()).isEqualTo(packetIds[1])
    }

    @Test
    fun `getPinnedPackets should return 401 when not authenticated`() {
        val result = restTemplate.getForEntity("/pins/packets", String::class.java)
        assertThat(result.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }
}
