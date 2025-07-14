package packit.unit.oneTimeJobs

import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import packit.model.Packet
import packit.oneTimeJobs.PacketDescriptionAndDisplayNameBackfill
import packit.repository.OneTimeJobRepository
import packit.repository.PacketRepository
import packit.service.OutpackServerClient
import packit.unit.packetToOutpackMetadata
import java.time.Instant
import kotlin.test.Test

/**
 * After this has been run on all servers, this can be deleted.
 */
class PacketDescriptionAndDisplayNameBackfillTest {
    private val now = Instant.now().epochSecond.toDouble()
    private val packets =
        listOf(
            Packet(
                "20240101-090000-4321gaga",
                "test",
                "display name 2",
                mapOf("alpha" to 1),
                now,
                now,
                now
            ),
            Packet(
                "20260101-090320-3224gaga",
                "test",
                "test name (latest display name)",
                mapOf("beta" to 1),
                now,
                now + 100,
                now
            )
        )

    @Test
    fun `back fills display name and description from outpack server`() {
        val packetRepository = mock<PacketRepository> {
            on { findAll() } doReturn packets
        }
        val outpackServerClient = mock<OutpackServerClient> {
            on { getMetadata() } doReturn packets.map { packetToOutpackMetadata(it) }
        }
        val oneTimeRepository = mock<OneTimeJobRepository>()

        val backfillJob = PacketDescriptionAndDisplayNameBackfill(
            packetRepository,
            outpackServerClient,
            oneTimeRepository
        )

        backfillJob.performJob()

        packets.forEach { packet ->
            assert(packet.displayName == packet.displayName) {
                "Display name for packet ${packet.id} did not match expected value"
            }
            assert(packet.description == "Description for ${packet.name}") {
                "Description for packet ${packet.id} did not match expected value"
            }
        }
        verify(packetRepository).saveAll(packets)
        verify(outpackServerClient).getMetadata()
        verify(packetRepository).findAll()

    }
}