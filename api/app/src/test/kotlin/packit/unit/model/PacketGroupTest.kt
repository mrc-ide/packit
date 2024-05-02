package packit.unit.model

import packit.model.PacketGroup
import packit.model.toDto
import kotlin.test.Test
import kotlin.test.assertEquals

class PacketGroupTest
{
    @Test
    fun `toDto returns correct PacketGroupDto for given PacketGroup`()
    {
        val packetGroup = PacketGroup("group1")
        packetGroup.id = 1
        val packetGroupDto = packetGroup.toDto()
        assertEquals("group1", packetGroupDto.name)
        assertEquals(1, packetGroupDto.id)
    }
}