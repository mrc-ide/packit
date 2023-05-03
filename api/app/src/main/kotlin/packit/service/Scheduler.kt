package packit.service

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
@ConditionalOnProperty(value = ["packit.scheduling.enabled"], havingValue = "true", matchIfMissing = true)
class Scheduler(
        private val packetService: PacketService,
        private val outpackServerClient: OutpackServerClient
)
{

    @Scheduled(fixedDelay = 1000)
    fun checkPackets()
    {
        val current = packetService.getChecksum()
        val new = outpackServerClient.getChecksum()
        if (current != new)
        {
            log.info("Refreshing packet metadata")
            packetService.importPackets()
        }
    }

    companion object
    {
        private val log = LoggerFactory.getLogger(Scheduler::class.java)
    }
}
