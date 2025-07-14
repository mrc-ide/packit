package packit.oneTimeJobs

import org.springframework.stereotype.Component
import packit.repository.OneTimeJobRepository
import packit.repository.PacketRepository
import packit.service.OutpackServerClient
import packit.service.utils.getDescriptionForPacket
import packit.service.utils.getDisplayNameForPacket

/**
 * After this has been run on all servers, this can be deleted.
 * Delete test for this in app/src/test/kotlin/packit/unit/oneTimeJobs/PacketDescriptionAndDisplayNameBackfillTest.kt
 */
@Component
class PacketDescriptionAndDisplayNameBackfill(
    private val packetRepository: PacketRepository,
    private val outpackServerClient: OutpackServerClient,
    oneTimeJobRepository: OneTimeJobRepository
) : BaseOneTimeJobRun(oneTimeJobRepository, PacketDescriptionAndDisplayNameBackfill::class.java.simpleName) {

    override fun performJob() {
        val packets = packetRepository.findAll()
        val outpackMetadata = outpackServerClient.getMetadata()

        for (packet in packets) {
            val matchingPacketMetadata = outpackMetadata.find { it.id == packet.id }
            if (matchingPacketMetadata == null) {
                log.debug("No metadata found for packet ${packet.id}")
                continue
            }

            val displayName = getDisplayNameForPacket(matchingPacketMetadata.custom, matchingPacketMetadata.name)
            val description = getDescriptionForPacket(matchingPacketMetadata.custom)

            packet.displayName = displayName
            packet.description = description
        }

        packetRepository.saveAll(packets)
    }
}
