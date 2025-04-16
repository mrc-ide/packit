package packit.security.ott

import org.springframework.security.authentication.AbstractAuthenticationToken
import java.time.Instant
import java.util.UUID

class OTTAuthenticationToken(
    ottId: UUID,
    packetId: String,
    filePaths: List<String>,
    expiresAt: Instant,
) : AbstractAuthenticationToken(listOf())
{
    private val principal = ottId
    private val details = mapOf(
        "permittedPacket" to packetId,
        "permittedFilePaths" to filePaths,
        "expiresAt" to expiresAt
    )

    override fun getDetails(): Map<String, Any> {
        return details
    }
    override fun getCredentials(): Any? = null
    override fun getPrincipal(): Any = principal

    fun getPermittedPacketId(): String = details["permittedPacket"] as String
    @Suppress("UNCHECKED_CAST")
    fun getPermittedFilePaths(): List<String> = details["permittedFilePaths"] as List<String>
    fun getExpiresAt(): Instant = details["expiresAt"] as Instant
}
