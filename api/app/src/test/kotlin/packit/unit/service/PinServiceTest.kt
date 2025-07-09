package packit.unit.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.PacketMetadata
import packit.model.Pin
import packit.model.TimeMetadata
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import packit.repository.PinRepository
import packit.repository.RunInfoRepository
import packit.service.BasePacketService
import packit.service.BasePinService
import packit.service.OutpackServer
import java.time.Instant
import java.util.UUID
import kotlin.test.assertEquals

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
        whenever(pinRepository.findAll()).thenReturn(
            listOf(
                Pin(UUID.randomUUID(), newPacket.id),
                Pin(UUID.randomUUID(), oldPacket.id),
                Pin(UUID.randomUUID(), middlePacket.id),
            )
        )
        whenever(packetService.getMetadataBy(newPacket.id)).thenReturn(newPacket)
        whenever(packetService.getMetadataBy(oldPacket.id)).thenReturn(oldPacket)
        whenever(packetService.getMetadataBy(middlePacket.id)).thenReturn(middlePacket)

        val sut = BasePinService(packetService, pinRepository)

        val pinnedPackets = sut.findAllPinnedPackets()

        assertThat(pinnedPackets).containsExactly(newPacket, middlePacket, oldPacket)
    }

    @Test
    fun `createPinByPacketId should create a pin for the given packet id`() {
        val packetId = "testPacketId"
        val pin = Pin(UUID.randomUUID(), packetId)
        whenever(pinRepository.findByPacketId(packetId)).thenReturn(null)
        whenever(pinRepository.save(any<Pin>())).thenReturn(pin)

        val sut = BasePinService(packetService, pinRepository)
        val createdPin = sut.createPinByPacketId(packetId)
        assertThat(createdPin.id).isNotNull()
        assertThat(createdPin.packetId).isEqualTo(packetId)
    }

    @Test
    fun `createPinByPacketId throws PackitException if pin already exists`() {
        val packetId = "testPacketId"
        val pin = Pin(UUID.randomUUID(), packetId)
        whenever(pinRepository.findByPacketId(any<String>())).thenReturn(pin)

        val sut = BasePinService(packetService, pinRepository)

        assertThrows<PackitException> {
            sut.createPinByPacketId(packetId)
        }.apply {
            assertEquals("pinAlreadyExists", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }

        verify(pinRepository, never()).save(any<Pin>())
    }

    @Test
    fun `createPinByPacketId throws PackitException when no packet exists with given id`() {
        val packetId = "nonExistingId"
        val packetRepository = mock<PacketRepository>()

        whenever(packetRepository.findById(packetId)).thenReturn(java.util.Optional.empty())

        val unmockedPacketService = BasePacketService(
            packetRepository,
            mock<PacketGroupRepository>(),
            mock<RunInfoRepository>(),
            mock<OutpackServer>()
        )
        val sut = BasePinService(unmockedPacketService, pinRepository)

        assertThrows<PackitException> {
            sut.createPinByPacketId(packetId)
        }.apply {
            assertEquals("packetNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }

        verify(pinRepository, never()).save(any<Pin>())
    }

    @Test
    fun `deletePin should delete a pin given an id of a packet`() {
        val packetId = "testPacketId"
        val pin = Pin(UUID.randomUUID(), packetId)
        whenever(pinRepository.findByPacketId(packetId)).thenReturn(pin)

        val sut = BasePinService(packetService, pinRepository)
        sut.deletePin(packetId)

        verify(pinRepository).delete(pin)
    }

    @Test
    fun `deletePin throws PackitException if pin does not exist`() {
        val sut = BasePinService(packetService, pinRepository)

        assertThrows<PackitException> {
            sut.deletePin("someNonExistingPacketId")
        }.apply {
            assertEquals("pinNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }

        verify(pinRepository, never()).delete(any<Pin>())
    }
}
