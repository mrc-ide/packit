package packit.unit.security

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.mockito.kotlin.*
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
    private val mockOperations = mock<MethodSecurityExpressionOperations> {
        on { authentication } doReturn mockAuthentication
    }

    @Test
    fun `canReadPacketMetadata calls packetService and returns true when hasAnyAuthority returns true`()
    {

        whenever(packetService.getPacket(packet.id)).thenReturn(packet)
        whenever(
            mockOperations.hasAnyAuthority(
                "packet.read",
                "packet.read:packet:${packet.name}:${packet.id}",
                "packet.read:packetGroup:${packet.name}"
            )
        ).thenReturn(true)

        val result = AuthorizationLogic(packetService).canReadPacketMetadata(mockOperations, packet.id)

        assertTrue(result)
        verify(packetService).getPacket(packet.id)
    }

    @Test
    fun `canReadPacketMetadata  calls packetService and returns false when hasAnyAuthority returns false`()
    {

        whenever(packetService.getPacket(packet.id)).thenReturn(packet)
        whenever(mockOperations.hasAnyAuthority(any())).thenReturn(false)

        val result = AuthorizationLogic(packetService).canReadPacketMetadata(mockOperations, packet.id)

        assertFalse(result)
        verify(packetService).getPacket(packet.id)
    }

    @Test
    fun `canReadPacket calls hasAnyAuthority and returns true when hasAnyAuthority returns true`()
    {

        whenever(
            mockOperations.hasAnyAuthority(
                "packet.read",
                "packet.read:packet:${packet.name}:${packet.id}",
                "packet.read:packetGroup:${packet.name}"
            )
        ).thenReturn(true)

        val result = AuthorizationLogic(packetService).canReadPacket(mockOperations, packet.id, packet.name)

        assertTrue(result)
    }

    @Test
    fun `canReadPacket calls hasAnyAuthority and returns false when hasAnyAuthority returns false`()
    {

        whenever(mockOperations.hasAnyAuthority(any())).thenReturn(false)

        val result = AuthorizationLogic(packetService).canReadPacket(mockOperations, packet.id, packet.name)

        assertFalse(result)
    }

    @Test
    fun `canReadPacketGroup calls hasAnyAuthority and returns true when hasAnyAuthority returns true`()
    {

        whenever(mockOperations.hasAnyAuthority("packet.read", "packet.read:packetGroup:${packet.name}")).thenReturn(
            true
        )

        val result = AuthorizationLogic(packetService).canReadPacketGroup(mockOperations, packet.name)

        assertTrue(result)
    }

    @Test
    fun `canReadPacketGroup returns true if the authentication authorities contain packet read packet name`()
    {
        whenever(mockAuthentication.authorities).thenReturn(
            listOf(SimpleGrantedAuthority("packet.read:packet:${packet.name}:${packet.id}"))
        )

        val result = AuthorizationLogic(packetService).canReadPacketGroup(mockOperations, packet.name)

        assertTrue(result)
    }

    @Test
    fun `canReadPacketGroup calls hasAnyAuthority and returns false when hasAnyAuthority returns false`()
    {

        whenever(mockOperations.hasAnyAuthority(any())).thenReturn(false)

        val result = AuthorizationLogic(packetService).canReadPacketGroup(mockOperations, packet.name)

        assertFalse(result)
    }
}
