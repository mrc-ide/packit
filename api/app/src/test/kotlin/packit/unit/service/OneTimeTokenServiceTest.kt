package packit.unit.service

import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import packit.exceptions.PackitException
import packit.model.OneTimeToken
import packit.model.Packet
import packit.repository.OneTimeTokenRepository
import packit.service.BaseOneTimeTokenService
import packit.service.BasePacketService
import java.time.Instant
import java.util.*

class OneTimeTokenServiceTest {
    private val oneTimeTokenRepository = mock<OneTimeTokenRepository>()
    private val packetService = mock<BasePacketService>()
    private val now = Instant.now()
    private val examplePacket = Packet(
        "packetId",
        "name",
        "", mapOf(),
        now.epochSecond.toDouble(),
        now.epochSecond.toDouble(),
        now.epochSecond.toDouble()
    )

    val sut = BaseOneTimeTokenService(oneTimeTokenRepository, packetService)

    @Test
    fun `createToken should tell repository to create a new token`() {
        val paths = listOf("file1", "file2")

        whenever(packetService.getPacket(examplePacket.id)).thenReturn(examplePacket)
        whenever(oneTimeTokenRepository.save(any<OneTimeToken>())).thenReturn(mock<OneTimeToken>())

        sut.createToken(examplePacket.id, paths)

        verify(oneTimeTokenRepository).save(
            argThat {
                packet == examplePacket &&
                    filePaths == paths &&
                    expiresAt.isAfter(now) &&
                    expiresAt.isBefore(now.plusSeconds(99))
            }
        )
    }

    @Test
    fun `getToken should retrieve token from repository and delete it`() {
        val tokenId = UUID.randomUUID()
        val token = OneTimeToken(tokenId, mock<Packet>(), listOf("path"), Instant.now())
        whenever(oneTimeTokenRepository.findById(tokenId)).thenReturn(Optional.of(token))

        sut.getToken(tokenId)

        verify(oneTimeTokenRepository).findById(tokenId)
        verify(oneTimeTokenRepository).deleteById(tokenId)
    }

    @Test
    fun `getToken should throw exception if token not found`() {
        val tokenId = UUID.randomUUID()
        whenever(oneTimeTokenRepository.findById(tokenId)).thenReturn(Optional.empty())

        assertThatThrownBy { sut.getToken(tokenId) }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key tokenDoesNotExist")
    }

    @Test
    fun `cleanUpExpiredTokens should call repository to delete expired tokens`() {
        sut.cleanUpExpiredTokens()

        verify(oneTimeTokenRepository).deleteByExpiresAtBefore(
            argThat { isBefore(now.plusSeconds(10)) && isAfter(now.minusSeconds(10)) }
        )
    }
}
