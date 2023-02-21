package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.IndexController
import packit.model.Packet
import packit.service.IndexService
import kotlin.test.assertEquals

class IndexControllerTest
{
    private val packets = listOf(Packet(1, "test", "test name", "", false))

    private val indexService = mock<IndexService> {
        on { getPacket() } doReturn packets
    }

    @Test
    fun `get packets`()
    {
        val sut = IndexController(indexService)
        val result = sut.getPackets()
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, packets)
    }
}