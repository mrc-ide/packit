package packit.service

import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.OneTimeToken
import packit.model.Packet
import packit.repository.OneTimeTokenRepository
import java.time.Instant
import java.util.*

interface OneTimeTokenService
{
    fun createToken(packetId: String, filePaths: List<String>): OneTimeToken
    fun getToken(id: UUID): OneTimeToken
    fun validateToken(tokenId: UUID, packetId: String, filePaths: List<String>): Boolean
    fun cleanUpExpiredTokens()
}

@Service
class BaseOneTimeTokenService(
    private val oneTimeTokenRepository: OneTimeTokenRepository,
    private val entityManager: EntityManager
) : OneTimeTokenService {
    @Transactional
    override fun createToken(packetId: String, filePaths: List<String>): OneTimeToken {
        val packet = entityManager.getReference(Packet::class.java, packetId)
        // NB the UUID.randomUUID function provides not only uniqueness but security, since it generates the UUID "using
        // a cryptographically strong pseudo random number generator". We rely on that implementation detail in order to
        // prevent the UUID being predictable.
        val oneTimeToken = OneTimeToken(
            id = UUID.randomUUID(),
            packet = packet,
            filePaths = filePaths,
            expiresAt = Instant.now().plusSeconds(10)
        )
        return oneTimeTokenRepository.save(oneTimeToken)
    }

    override fun getToken(id: UUID): OneTimeToken {
        return oneTimeTokenRepository.findById(id).orElseThrow { PackitException("doesNotExist", HttpStatus.NOT_FOUND) }
    }

    @Transactional
    override fun validateToken(tokenId: UUID, packetId: String, filePaths: List<String>): Boolean {
        val token = getToken(tokenId)
        if (token.expiresAt.isBefore(Instant.now())) {
            deleteToken(tokenId)
            throw PackitException("tokenExpired", HttpStatus.FORBIDDEN)
        }
        if (token.packet.id != packetId) {
            throw PackitException("tokenInvalid", HttpStatus.FORBIDDEN)
        }
        if (token.filePaths.size != filePaths.size || !token.filePaths.containsAll(filePaths)) {
            throw PackitException("tokenInvalid", HttpStatus.FORBIDDEN)
        }
        deleteToken(tokenId)
        return true
    }

    override fun cleanUpExpiredTokens() {
        oneTimeTokenRepository.deleteByExpiresAtBefore(Instant.now())
    }

    private fun deleteToken(id: UUID) {
        oneTimeTokenRepository.deleteById(id)
    }
}
