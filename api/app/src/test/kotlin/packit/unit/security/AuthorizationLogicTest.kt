package packit.unit.security


import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.model.Packet
import packit.security.AuthorizationLogic
import packit.service.PacketService
import java.time.Instant
import kotlin.test.Test

class AuthorizationLogicTest
{
    private var packetService = mock<PacketService>()
    private val now = Instant.now().epochSecond.toDouble()
    private val packet = Packet(
        "20180203-120000-abdefg56",
        "test",
        "test name",
        mapOf("name" to "value"),
        false,
        now,
        now,
        now
    )
    private val mockAuthentication = mock<Authentication>()
    private val mockOperations = mock<MethodSecurityExpressionOperations>()

    @Test
    fun `canReadPacketMetadata returns true when authority matches packet id`()
    {

        whenever(packetService.getPacket(packet.id)).thenReturn(packet)
        val authorities = listOf(SimpleGrantedAuthority("packet.read:packet:${packet.id}"))
        whenever(mockAuthentication.authorities).thenReturn(authorities)
        whenever(mockOperations.authentication).thenReturn(mockAuthentication)

        val result = AuthorizationLogic(packetService).canReadPacketMetadata(mockOperations, packet.id)

        assertTrue(result)
    }

    @Test
    fun `canReadPacketMetadata returns true when authority matches packet group`()
    {

        whenever(packetService.getPacket(packet.id)).thenReturn(packet)
        val authorities = listOf(SimpleGrantedAuthority("packet.read:packetGroup:${packet.name}"))
        whenever(mockAuthentication.authorities).thenReturn(authorities)
        whenever(mockOperations.authentication).thenReturn(mockAuthentication)

        val result = AuthorizationLogic(packetService).canReadPacketMetadata(mockOperations, packet.id)

        assertTrue(result)
    }

    @Test
    fun `canReadPacketMetadata returns false when no matching authority found`()
    {

        whenever(packetService.getPacket(packet.id)).thenReturn(packet)
        val authorities = listOf(SimpleGrantedAuthority("packet.read:packetGroup:otherPacketName"))
        whenever(mockAuthentication.authorities).thenReturn(authorities)
        whenever(mockOperations.authentication).thenReturn(mockAuthentication)

        val result = AuthorizationLogic(packetService).canReadPacketMetadata(mockOperations, packet.id)

        assertFalse(result)
    }
}