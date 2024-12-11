package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import packit.controllers.PacketGroupController
import packit.model.dto.PacketGroupDetail
import packit.model.dto.PacketGroupDetailImpl
import packit.service.PacketGroupService
import packit.service.PacketService
import kotlin.test.assertEquals

class PacketGroupControllerTest {
    private val packetGroupService = mock<PacketGroupService> {
        on { getPacketGroupDetail(any()) } doReturn PacketGroupDetailImpl(
            "20180818-164847-7574833b", "Display Name 1", "Accurate description"
        )
    }

    private val sut = PacketGroupController(packetGroupService)

    @Test
    fun `get packet group display name, latest packet id, and description`() {
        val result: ResponseEntity<PacketGroupDetail> = sut.getDetail("test-packetGroupName-1")

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("20180818-164847-7574833b", result.body?.latestPacketId)
        assertEquals("Display Name 1", result.body?.displayName)
        assertEquals("Accurate description", result.body?.packetDescription)
        verify(packetGroupService).getPacketGroupDetail("test-packetGroupName-1")
    }
}
