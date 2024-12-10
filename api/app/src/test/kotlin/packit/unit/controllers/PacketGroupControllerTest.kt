package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import packit.controllers.PacketGroupController
import packit.model.dto.PacketIdAndDisplayName
import packit.model.dto.PacketIdAndDisplayNameImpl
import packit.service.PacketGroupService
import kotlin.test.assertEquals

class PacketGroupControllerTest {
    private val packetGroupService = mock<PacketGroupService> {
        on { getLatestIdAndDisplayName(any()) } doReturn PacketIdAndDisplayNameImpl(
            "20180818-164847-7574833b", "Display Name 1"
        )
    }

    private val sut = PacketGroupController(packetGroupService)

    @Test
    fun `get latest packet id and display name`() {
        val result: ResponseEntity<PacketIdAndDisplayName> =
            sut.getLatestPacketIdAndDisplayName("test-packetGroupName-1")

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("20180818-164847-7574833b", result.body?.latestPacketId)
        assertEquals("Display Name 1", result.body?.displayName)
        verify(packetGroupService).getLatestIdAndDisplayName("test-packetGroupName-1")
    }
}