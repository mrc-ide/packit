package packit.service

import jakarta.transaction.Transactional
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.OneTimeToken
import packit.repository.OneTimeTokenRepository
import java.time.Instant
import java.util.*

interface OneTimeTokenService
{
    fun createToken(packetId: String, filePaths: List<String>): OneTimeToken
    fun getToken(id: UUID): OneTimeToken
    fun cleanUpExpiredTokens()
}

private const val EXPIRY_BUFFER_SECONDS = 30L

@Service
class BaseOneTimeTokenService(
    private val oneTimeTokenRepository: OneTimeTokenRepository,
    private val packetService: PacketService
) : OneTimeTokenService {
    @Transactional
    override fun createToken(packetId: String, filePaths: List<String>): OneTimeToken {
        val packet = packetService.getPacket(packetId)
        // NB the UUID.randomUUID function provides not only uniqueness but security, since it generates the UUID "using
        // a cryptographically strong pseudo random number generator". We rely on that implementation detail in order to
        // prevent the UUID being predictable.
        val oneTimeToken = OneTimeToken(
            id = UUID.randomUUID(),
            packet = packet,
            filePaths = filePaths,
            expiresAt = Instant.now().plusSeconds(EXPIRY_BUFFER_SECONDS)
        )
        return oneTimeTokenRepository.save(oneTimeToken)
    }

    override fun getToken(id: UUID): OneTimeToken {
        val oneTimeToken = oneTimeTokenRepository.findById(id).orElseThrow {
            PackitException("tokenDoesNotExist", HttpStatus.UNAUTHORIZED)
        }
        oneTimeTokenRepository.deleteById(oneTimeToken.id)
        return oneTimeToken
    }

    override fun cleanUpExpiredTokens() {
        oneTimeTokenRepository.deleteByExpiresAtBefore(Instant.now())
    }
}
