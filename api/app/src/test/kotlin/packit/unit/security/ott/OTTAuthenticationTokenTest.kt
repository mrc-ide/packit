package packit.unit.security.ott

import org.junit.jupiter.api.Test
import packit.security.ott.OTTAuthenticationToken
import java.time.Instant
import java.util.UUID
import kotlin.test.assertEquals

class OTTAuthenticationTokenTest {
    @Test
    fun `can retrieve principal`() {
        val ottId = UUID.randomUUID()
        val authToken = OTTAuthenticationToken(
            ottId,
            "packet123",
            listOf("file1.txt", "file2.txt"),
            Instant.now()
        )

        assertEquals(ottId, authToken.principal)
    }

    @Test
    fun `can retrieve details`() {
        val ottId = UUID.randomUUID()
        val packetId = "packet123"
        val filePaths = listOf("file1.txt", "file2.txt")
        val expiresAt = Instant.now()

        val authToken = OTTAuthenticationToken(
            ottId,
            packetId,
            filePaths,
            expiresAt
        )

        val details = authToken.details
        assertEquals(packetId, details["permittedPacket"])
        assertEquals(filePaths, details["permittedFilePaths"])
        assertEquals(expiresAt, details["expiresAt"])
    }

    @Test
    fun `can retrieve permitted packet ID`() {
        val authToken = OTTAuthenticationToken(
            UUID.randomUUID(),
            "packet123",
            listOf("file1.txt", "file2.txt"),
            Instant.now()
        )

        assertEquals("packet123", authToken.getPermittedPacketId())
    }

    @Test
    fun `can retrieve permitted file paths`() {
        val filePaths = listOf("file1.txt", "file2.txt")
        val authToken = OTTAuthenticationToken(
            UUID.randomUUID(),
            "packet123",
            filePaths,
            Instant.now()
        )

        assertEquals(filePaths, authToken.getPermittedFilePaths())
    }

    @Test
    fun `can retrieve expiration time`() {
        val expiresAt = Instant.now()
        val authToken = OTTAuthenticationToken(
            UUID.randomUUID(),
            "packet123",
            listOf("file1.txt", "file2.txt"),
            expiresAt
        )

        assertEquals(expiresAt, authToken.getExpiresAt())
    }
}
