package packit.unit.security

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.mockito.kotlin.*
import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.security.access.expression.SecurityExpressionRoot
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.model.Packet
import packit.security.AuthorizationLogic
import packit.service.PacketService
import java.time.Instant
import kotlin.test.Test

class AuthorizationLogicTest
{
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

    private var packetService = mock<PacketService>() {
        on { getPacket(packet.id) } doReturn packet
    }

    private val sut = AuthorizationLogic(packetService)

    private fun createOps(authorities: List<String>): SecurityExpressionOperations {
        val token = TestingAuthenticationToken("", "", authorities.map{SimpleGrantedAuthority(it)})
        return object : SecurityExpressionRoot(token) {}
    }

    @Test
    fun `canReadPacket returns true if has global authority`()
    {
        val ops = createOps(listOf("packet.read"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns true if has packet authority`()
    {
        val ops = createOps(listOf("packet.read:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns true if has packetGroup authority`()
    {
        val ops = createOps(listOf("packet.read:packetGroup:${packet.name}"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns false if has no authority`()
    {
        val ops = createOps(emptyList())
        assertFalse(sut.canReadPacket(ops, packet))
        assertFalse(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacketGroup returns true if has global authority`()
    {
        val ops = createOps(listOf("packet.read"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packet authority`()
    {
        val ops = createOps(listOf("packet.read:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packetGroup authority`()
    {
        val ops = createOps(listOf("packet.read:packetGroup:${packet.name}"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns false if has no authority`()
    {
        val ops = createOps(emptyList())
        assertFalse(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns false if has authority for different group`()
    {
        val ops = createOps(emptyList())
        assertFalse(sut.canReadPacketGroup(ops, "test2"))
    }
}
