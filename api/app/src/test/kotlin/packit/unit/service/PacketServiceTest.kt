package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.model.Packet
import packit.repository.PacketRepository
import packit.service.BasePacketService
import kotlin.test.assertEquals

class PacketServiceTest
{
    private val packets = listOf(Packet("1", "test", "test name", mapOf("name" to "value"), false))

    private val packetRepository = mock<PacketRepository> {
        on { findAll() } doReturn packets
    }

    @Test
    fun`gets packets`()
    {
        val sut = BasePacketService(packetRepository)

        val result = sut.getPackets()

        assertEquals(result, packets)
    }
}