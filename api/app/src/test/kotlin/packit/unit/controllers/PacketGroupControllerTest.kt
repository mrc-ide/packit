package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import packit.controllers.PacketGroupController
import packit.model.dto.PacketGroupDisplay
import packit.service.PacketGroupService
import packit.service.PacketService
import kotlin.test.assertEquals

class PacketGroupControllerTest {
    private val packetGroupService = mock<PacketGroupService>()
    private val packetService = mock<PacketService> {
        on { getPacketGroupDisplay(any()) } doReturn PacketGroupDisplay(
            "Display Name 1", "Accurate description"
        )
    }

    private val sut = PacketGroupController(packetGroupService, packetService)

    @Test
    fun `get packet group display name and description`() {
        val result: ResponseEntity<PacketGroupDisplay> = sut.getDisplay("test-packetGroupName-1")

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("Display Name 1", result.body?.latestDisplayName)
        assertEquals("Accurate description", result.body?.description)
        verify(packetService).getPacketGroupDisplay("test-packetGroupName-1")
    }
}
