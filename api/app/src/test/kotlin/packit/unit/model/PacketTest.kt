package packit.unit.model

import packit.model.Packet
import packit.model.toBasicDto
import packit.model.toDto
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PacketTest
{
    @Test
    fun `toDto returns correct PacketDto for given Packet`()
    {
        val packet = Packet("id1", "name1", "displayName1", emptyMap(), true, 1.0, 2.0, 3.0)
        val packetDto = packet.toDto()
        assertEquals("id1", packetDto.id)
        assertEquals("name1", packetDto.name)
        assertEquals("displayName1", packetDto.displayName)
        assertTrue(packetDto.parameters.isEmpty())
        assertTrue(packetDto.published)
        assertEquals(1.0, packetDto.importTime)
        assertEquals(2.0, packetDto.startTime)
        assertEquals(3.0, packetDto.endTime)
    }

    @Test
    fun `toDto returns correct PacketDto for Packet with non-empty parameters`()
    {
        val parameters = mapOf("param1" to "value1")
        val packet = Packet("id1", "name1", "displayName1", parameters, true, 1.0, 2.0, 3.0)
        val packetDto = packet.toDto()
        assertEquals(parameters, packetDto.parameters)
    }

    @Test
    fun `toBasicDto returns correct BasicPacketDto for given Packet`()
    {
        val packet = Packet("id1", "name1", "displayName1", emptyMap(), true, 1.0, 2.0, 3.0)
        val basicPacketDto = packet.toBasicDto()
        assertEquals("id1", basicPacketDto.id)
        assertEquals("name1", basicPacketDto.name)
    }
}