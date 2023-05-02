package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.PacketController
import packit.model.Packet
import packit.service.PacketService
import kotlin.test.assertEquals

class PacketControllerTest
{
    private val packets = listOf(Packet("1", "test", "test name", mapOf("name" to "value"), false))

    private val indexService = mock<PacketService> {
        on { getPackets() } doReturn packets
    }

    @Test
    fun `get packets`()
    {
        val sut = PacketController(indexService)
        val result = sut.index()
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, packets)
    }
}
