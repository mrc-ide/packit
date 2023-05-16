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
    private val packets = listOf(
            Packet(
                    "1", "test", "test name",
                    mapOf("name" to "value"), false
            ),
            Packet(
                    "2", "test2", "test2 name",
                    mapOf("name" to "value"), false
            )
    )

    private val packetRepository = mock<PacketRepository> {
        on { findAll() } doReturn packets
        on { findAllIds() } doReturn packets.map { it.id }
    }

    @Test
    fun `gets packets`()
    {
        val sut = BasePacketService(packetRepository)

        val result = sut.getPackets()

        assertEquals(result, packets)
    }

    @Test
    fun `gets checksum of packet ids`()
    {
        val sut = BasePacketService(packetRepository)

        val result = sut.getChecksum()

        // outpack:::hash_ids(c("1", "2"))
        val expected =
                "sha256:6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918"
        assertEquals(result, expected)
    }
}
