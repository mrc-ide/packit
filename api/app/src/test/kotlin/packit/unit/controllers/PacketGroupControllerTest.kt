package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.data.domain.PageImpl
import org.springframework.http.HttpStatus
import packit.controllers.PacketGroupController
import packit.model.Packet
import packit.model.PageablePayload
import packit.model.dto.PacketGroupSummary
import packit.model.toDto
import packit.service.PacketGroupService
import packit.service.PacketService
import packit.service.RoleService
import packit.service.UserRoleService
import java.time.Instant
import kotlin.test.assertEquals

class PacketGroupControllerTest {
    val now = Instant.now().epochSecond.toDouble()

    private val packets = listOf(
        Packet(
            "20180818-164847-7574883b",
            "test1",
            "test name1",
            mapOf("name" to "value"),
            now,
            now,
            now,
        ),
        Packet(
            "20170819-164847-7574883b",
            "test3",
            "test name3",
            mapOf("alpha" to true),
            1690902034.0,
            1690902034.0,
            1690902034.0
        )
    )

    private val packetGroupSummaries = listOf(
        PacketGroupSummary(
            name = "analysis 1",
            packetCount = 10,
            latestId = "20180818-164847-7574883b",
            latestTime = 1690902034.0,
            latestDisplayName = "display name for analysis 1",
        ),
        PacketGroupSummary(
            name = "analysis 2",
            packetCount = 10,
            latestId = "20180818-164847-7574883b",
            latestTime = 1690902034.0,
            latestDisplayName = "display name for analysis 2",
        ),
    )

    private val mockPageablePackets = PageImpl(packets)
    private val mockPacketGroupsSummary = PageImpl(packetGroupSummaries)

    private val packetService = mock<PacketService> {
        on { getPackets(PageablePayload(0, 10), "", "") } doReturn mockPageablePackets
        on { getPacketsByName(anyString()) } doReturn packets
    }

    private val packetGroupService = mock<PacketGroupService> {
        on { getPacketGroupSummaries(PageablePayload(0, 10), "") } doReturn mockPacketGroupsSummary
    }
    private val roleService = mock<RoleService>()
    private val userRoleService = mock<UserRoleService>()

    private val sut = PacketGroupController(packetService, packetGroupService, roleService, userRoleService)

    @Test
    fun `get packets by packet group name`() {
        val result = sut.getPacketsByName("pg1")

        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, packets.map { it.toDto() })
        verify(packetService).getPacketsByName("pg1")
    }

    @Test
    fun `get packet groups summary`() {
        val result = sut.getPacketGroupSummaries(0, 10, "")
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPacketGroupsSummary)
        verify(packetGroupService).getPacketGroupSummaries(PageablePayload(0, 10), "")
    }
}
