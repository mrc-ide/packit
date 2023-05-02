package packit.service

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
class Scheduler(private val packetService: PacketService,
                private val outpackServerClient: OutpackServerClient) {

    @Scheduled(fixedDelay = 1000)
    fun checkPackets() {
        val current = packetService.getChecksum()
        val new = outpackServerClient.getChecksum()
        if (current != new) {
            log.info("Packet info is out of date: current {} =/= new {} ",
                    current, new)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(Scheduler::class.java)
    }
}
