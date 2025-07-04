package packit.unit.controllers

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import packit.controllers.PinController
import packit.model.PacketMetadata
import packit.model.Pin
import packit.model.TimeMetadata
import packit.service.PinService
import java.time.Instant
import kotlin.test.assertEquals

class PinControllerTest {
    private val packet1id = "20180818-164847-7574883b"
    private val packet2id = "20170819-164847-7574883b"
    private val pinService = mock<PinService> {
        on { findAllPinnedPackets() } doReturn listOf(
            PacketMetadata(
                packet1id,
                "test",
                mapOf("name" to "value"),
                emptyList(),
                null,
                TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
                emptyMap(),
                emptyList()
            ),
            PacketMetadata(
                packet2id,
                "test",
                mapOf("name" to "value"),
                emptyList(),
                null,
                TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
                emptyMap(),
                emptyList()
            )
        )
        on { createPinByPacketId(packet1id) } doReturn Pin(packetId = packet1id)
    }

    private val sut = PinController(pinService)

    @Test
    fun `getPinnedPackets should return packet metadata`() {
        val response = sut.getPinnedPackets()
        val responseBody = response.body

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(2, responseBody?.size)
        assertThat(
            listOf(responseBody?.get(0)?.id, responseBody?.get(1)?.id)
        ).containsExactly(packet1id, packet2id)
    }

    @Test
    fun `pinPacket should create a pin and return its packet id`() {
        val response = sut.pinPacket(packet1id)
        val responseBody = response.body

        verify(pinService).createPinByPacketId(packet1id)
        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(packet1id, responseBody?.packetId)
    }
}
