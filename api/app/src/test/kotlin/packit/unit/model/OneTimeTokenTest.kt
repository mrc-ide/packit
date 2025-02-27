package packit.unit.model

import org.junit.jupiter.api.Test
import packit.model.OneTimeToken
import packit.model.Packet
import packit.model.toDto
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals

class OneTimeTokenTest
{
    private val now = Instant.now()
    private val examplePacket = Packet(
        "packetId",
        "name",
        "", mapOf(),
        false,
        now.epochSecond.toDouble(),
        now.epochSecond.toDouble(),
        now.epochSecond.toDouble()
    )

    @Test
    fun `toDto returns correct OneTimeTokenDto for given OneTimeToken`()
    {
        val token = OneTimeToken(
            id = UUID.randomUUID(),
            packet = examplePacket,
            filePaths = listOf("file1", "file2"),
            expiresAt = now
        )
        val tokenDto = token.toDto()
        assertEquals(token.id, tokenDto.id)
    }
}