package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.PacketController
import packit.model.Packet
import packit.service.PacketService
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals

class PacketControllerTest
{
    private val packets = listOf(
            Packet(
                    "1", "test", "test name",
                    mapOf("name" to "value"), false, Instant.now().epochSecond
            )
    )

    private val indexService = mock<PacketService> {
        on { getPackets() } doReturn packets
        on { getPacket(anyString()) } doReturn Optional.of(packets.first())
    }

    @Test
    fun `get packets`()
    {
        val sut = PacketController(indexService)
        val result = sut.index()
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, packets)
    }

    @Test
    fun `get packet by id`()
    {
        val sut = PacketController(indexService)
        val result = sut.findPacket("1")
        val responseBody = result.body?.get()
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(responseBody, packets.first())
    }
}
