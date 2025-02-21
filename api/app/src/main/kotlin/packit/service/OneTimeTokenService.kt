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
    fun validateToken(id: UUID, packetId: String, filePaths: List<String>): Boolean
}

@Service
class BaseOneTimeTokenService(
    private val oneTimeTokenRepository: OneTimeTokenRepository,
    private val entityManager: EntityManager
) : OneTimeTokenService {
    @Transactional
    override fun createToken(packetId: String, filePaths: List<String>): OneTimeToken {
        val packet = entityManager.getReference(Packet::class.java, packetId)
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
    override fun validateToken(id: UUID, packetId: String, filePaths: List<String>): Boolean {
        val token = getToken(id)
        if (token.expiresAt.isBefore(Instant.now())) {
            deleteToken(id)
            throw PackitException("expiredToken", HttpStatus.FORBIDDEN)
        }
        if (token.packet.id != packetId) {
            throw PackitException("invalidToken", HttpStatus.FORBIDDEN)
        }
        if (token.filePaths.size != filePaths.size || !token.filePaths.containsAll(filePaths)) {
            throw PackitException("invalidToken", HttpStatus.FORBIDDEN)
        }
        deleteToken(id)
        return true
    }

    private fun deleteToken(id: UUID) {
        oneTimeTokenRepository.deleteById(id)
    }
}