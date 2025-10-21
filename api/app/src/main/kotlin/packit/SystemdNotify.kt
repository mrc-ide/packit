package packit

import org.newsclub.net.unix.*
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import java.net.DatagramPacket

// This implements the sd_notify protocol from systemd, allowing Packit to
// inform systemd of when it is ready. It allows systemd to have a more
// accurate view of the state of the process.
//
// The protocol is pretty basic: systemd defines a NOTIFY_SOCKET environment
// variable containing the path to a Unix datagram socket. When the application
// is ready, we write `READY=1` to the socket.
//
// We use a Spring Boot event listener to watch for when the application is
// ready.
//
// https://www.freedesktop.org/software/systemd/man/latest/sd_notify.html
// https://www.freedesktop.org/software/systemd/man/latest/systemd-notify.html
@Component
class SystemdNotify {
    @EventListener
    fun onApplicationReadyEvent() {
        val path = System.getenv("NOTIFY_SOCKET")
        if (path != null) {
            // '@' as the first byte means an abstract Unix socket - we need to
            // replace that with a null byte.
            val pathBytes = path.toByteArray()
            if (pathBytes[0] == '@'.code.toByte()) {
                pathBytes[0] = 0
            }

            AFUNIXDatagramSocket.newInstance().use { socket ->
                socket.connect(AFUNIXSocketAddress.of(pathBytes))
                val data = "READY=1".toByteArray()
                socket.send(DatagramPacket(data, data.size))
            }
        }
    }
}
