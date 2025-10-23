package packit.service

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
@ConditionalOnProperty(value = ["packit.scheduling.enabled"], havingValue = "true", matchIfMissing = true)
class Scheduler(
    private val oneTimeTokenService: OneTimeTokenService,
    private val packetService: PacketService,
    private val outpackServerClient: OutpackServerClient,
    private val deviceAuthRequestService: DeviceAuthRequestService
) {

    @Scheduled(fixedDelay = 10000, initialDelay = 0)
    fun checkPackets() = withSystemAuth {
        val current = packetService.getChecksum()
        val new = outpackServerClient.getChecksum()
        if (current != new) {
            log.info("Refreshing packet metadata")
            packetService.importPackets()
        }
    }

    @Scheduled(cron = "@daily")
    fun cleanUpExpiredTokens() = withSystemAuth {
        log.info("Cleaning up expired tokens")
        oneTimeTokenService.cleanUpExpiredTokens()
    }

    @Scheduled(cron = "@daily")
    fun cleanUpExpiredDeviceAuthRequests() = withSystemAuth {
        log.info("Cleaning up expired device auth requests")
        deviceAuthRequestService.cleanUpExpiredRequests()
    }

    internal fun <T> withSystemAuth(func: () -> T): T {
        val auth = UsernamePasswordAuthenticationToken(
            "system",
            null,
            listOf(
                SimpleGrantedAuthority("user.manage"),
                SimpleGrantedAuthority("packet.manage"),
                SimpleGrantedAuthority("packet.run"),
                SimpleGrantedAuthority("outpack.read"),
                SimpleGrantedAuthority("outpack.write"),
            )
        )
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = auth
        SecurityContextHolder.setContext(context)
        return try {
            func()
        } finally {
            SecurityContextHolder.clearContext()
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(Scheduler::class.java)
    }
}
