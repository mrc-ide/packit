package packit.service

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
@ConditionalOnProperty(value = ["packit.scheduling.enabled"], havingValue = "true", matchIfMissing = true)
class Scheduler(
    private val oneTimeTokenService: OneTimeTokenService,
    private val packetService: PacketService,
    private val outpackServerClient: OutpackServerClient,
    private val deviceAuthRequestService: BaseDeviceAuthRequestService
) {

    @Scheduled(fixedDelay = 10000)
    fun checkPackets() {
        val current = packetService.getChecksum()
        val new = outpackServerClient.getChecksum()
        if (current != new) {
            log.info("Refreshing packet metadata")
            packetService.importPackets()
        }
    }

    @Scheduled(cron = "@daily")
    fun cleanUpExpiredTokens() {
        log.info("Cleaning up expired tokens")
        oneTimeTokenService.cleanUpExpiredTokens()
    }

    @Scheduled(cron = "@daily")
    fun cleanUpExpiredDeviceAuthRequests() {
        log.info("Cleaning up expired device auth requests")
        deviceAuthRequestService.cleanUpExpiredRequests()
    }

    companion object {
        private val log = LoggerFactory.getLogger(Scheduler::class.java)
    }
}
