package packit.unit.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import packit.model.PacketMetadata
import packit.model.Pin
import packit.model.TimeMetadata
import packit.repository.PinRepository
import packit.service.BasePacketService
import packit.service.BasePinService
import java.time.Instant
import java.util.UUID

class PinServiceTest {
    private val packetService = mock<BasePacketService>()
    private val pinRepository = mock<PinRepository>()

    private val newPacket = PacketMetadata(
        "packetId",
        "name",
        emptyMap(),
        emptyList(),
        null,
        TimeMetadata(
            Instant.now().epochSecond.toDouble(),
            Instant.now().epochSecond.toDouble(),
        ),
        emptyMap(),
        emptyList()
    )
    private val oldPacket = PacketMetadata(
        "oldPacketId",
        "oldName",
        emptyMap(),
        emptyList(),
        null,
        TimeMetadata(
            Instant.now().minusSeconds(1000).epochSecond.toDouble(),
            Instant.now().minusSeconds(1000).epochSecond.toDouble(),
            ),
        emptyMap(),
        emptyList()
    )
    private val middlePacket = PacketMetadata(
        "middlePacketId",
        "middleName",
        emptyMap(),
        emptyList(),
        null,
        TimeMetadata(
            Instant.now().minusSeconds(500).epochSecond.toDouble(),
            Instant.now().minusSeconds(500).epochSecond.toDouble(),
        ),
        emptyMap(),
        emptyList()
    )

    @Test
    fun `findAllPinnedPackets should return sorted list of pinned packets`() {
        whenever(pinRepository.findAll()).thenReturn(listOf(
            Pin(UUID.randomUUID(), newPacket.id),
            Pin(UUID.randomUUID(), oldPacket.id),
            Pin(UUID.randomUUID(), middlePacket.id),
        ))
        whenever(packetService.getMetadataBy(newPacket.id)).thenReturn(newPacket)
        whenever(packetService.getMetadataBy(oldPacket.id)).thenReturn(oldPacket)
        whenever(packetService.getMetadataBy(middlePacket.id)).thenReturn(middlePacket)

        val sut = BasePinService(packetService, pinRepository)

        val pinnedPackets = sut.findAllPinnedPackets()

        assertThat(pinnedPackets).containsExactly(newPacket, middlePacket, oldPacket)
    }
}