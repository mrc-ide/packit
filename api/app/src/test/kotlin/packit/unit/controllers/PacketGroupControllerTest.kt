package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import packit.controllers.PacketGroupController
import packit.model.PacketGroupDisplay
import packit.service.PacketGroupService
import kotlin.test.assertEquals

class PacketGroupControllerTest {
    private val packetGroupService = mock<PacketGroupService> {
        on { getPacketGroupDisplay(any()) } doReturn PacketGroupDisplay(
            1,
            name = "my_packet",
            latestDisplayName = "Display Name 1",
            latestDescription = "Accurate description",
            latestStartTime = 1234567890.0,
            packetCount = 3,
            latestPacketId = "uuid123"
        )
    }

    private val sut = PacketGroupController(packetGroupService)

    @Test
    fun `get packet group display name and description`() {
        val result: ResponseEntity<PacketGroupDisplay> = sut.getDisplay("test-packetGroupName-1")

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("Display Name 1", result.body?.latestDisplayName)
        assertEquals("Accurate description", result.body?.latestDescription)
        verify(packetGroupService).getPacketGroupDisplay("test-packetGroupName-1")
    }
}
