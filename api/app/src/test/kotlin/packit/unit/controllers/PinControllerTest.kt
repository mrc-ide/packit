package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.PinController
import packit.model.PacketMetadata
import packit.model.Pin
import packit.model.TimeMetadata
import packit.repository.PinRepository
import packit.service.PacketService
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals

class PinControllerTest {
    private val packet1id = "20180818-164847-7574883b"
    private val packet2id = "20170819-164847-7574883b"
    private val pinRepository = mock<PinRepository> {
        on { findAll() } doReturn listOf(
            Pin(packetId = packet1id),
            Pin(packetId = packet2id)
        )
    }

    private val packetService = mock<PacketService> {
        on { getMetadataBy(packet1id) } doReturn PacketMetadata(
            packet1id,
            "test",
            mapOf("name" to "value"),
            emptyList(),
            null,
            TimeMetadata(
                Instant.now().plusSeconds(100).epochSecond.toDouble(),
                Instant.now().minusSeconds(100).epochSecond.toDouble()
            ),
            emptyMap(),
            emptyList()
        )
        on { getMetadataBy(packet2id) } doReturn PacketMetadata(
            packet2id,
            "test",
            mapOf("name" to "value"),
            emptyList(),
            null,
            TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
            emptyMap(),
            emptyList()
        )
    }

    private val sut = PinController(packetService, pinRepository)

    @Test
    fun `getPinnedPackets should return sorted packet metadata`() {
        val response = sut.getPinnedPackets()
        val responseBody = response.body

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(2, responseBody?.size)
        assertEquals(packet2id, responseBody?.get(0)?.id)
        assertEquals(packet1id, responseBody?.get(1)?.id)
    }
}
