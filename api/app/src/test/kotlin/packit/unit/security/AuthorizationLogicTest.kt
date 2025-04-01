package packit.unit.security

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.security.access.expression.SecurityExpressionRoot
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.model.Packet
import packit.security.AuthorizationLogic
import packit.service.BasePermissionService
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
        now,
        now,
        now
    )

    private var packetService = mock<PacketService>() {
        on { getPacket(packet.id) } doReturn packet
    }
    private var permissionService = BasePermissionService(mock())

    private val sut = AuthorizationLogic(packetService, permissionService)

    private fun createOps(authorities: List<String>): SecurityExpressionOperations
    {
        val token = TestingAuthenticationToken("", "", authorities.map { SimpleGrantedAuthority(it) })
        return object : SecurityExpressionRoot(token)
        {}
    }

    @Test
    fun `canReadPacket returns true if has global manage authority`()
    {
        val ops = createOps(listOf("packet.manage"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns true if has packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns true if has packetGroup manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packetGroup:${packet.name}"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns true if has global read authority`()
    {
        val ops = createOps(listOf("packet.read"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns true if has packet read authority`()
    {
        val ops = createOps(listOf("packet.read:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canReadPacket(ops, packet))
        assertTrue(sut.canReadPacket(ops, packet.id))
    }

    @Test
    fun `canReadPacket returns true if has packetGroup read authority`()
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
    fun `canReadPacketGroup returns true if has global read authority`()
    {
        val ops = createOps(listOf("packet.read"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packet read authority`()
    {
        val ops = createOps(listOf("packet.read:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packetGroup read authority`()
    {
        val ops = createOps(listOf("packet.read:packetGroup:${packet.name}"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has global manage authority`()
    {
        val ops = createOps(listOf("packet.manage"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canReadPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packetGroup manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packetGroup:${packet.name}"))
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

    @Test
    fun `canReadRoles returns true if has user manage authority`()
    {
        val ops = createOps(listOf("user.manage"))
        assertTrue(sut.canReadRoles(ops))
    }

    @Test
    fun `canReadRoles returns true if has global packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage"))
        assertTrue(sut.canReadRoles(ops))
    }

    @Test
    fun `canReadRoles returns true if has any scoped packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:test:123"))
        assertTrue(sut.canReadRoles(ops))
    }

    @Test
    fun `canReadRoles returns false if has no manage authority`()
    {
        val ops = createOps(listOf("packet.read"))
        assertFalse(sut.canReadRoles(ops))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true if has global packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.name, packet.id))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true if has user manage authority`()
    {
        val ops = createOps(listOf("user.manage"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.name, packet.id))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true with packetId when has specific packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.name, packet.id))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true with packetId when has packetGroup manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packetGroup:${packet.name}"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.name, packet.id))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true with when has packetGroup manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packetGroup:${packet.name}"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.name))
    }

    @Test
    fun `canUpdatePacketReadRoles returns false with no packetId when lacks proper authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:${packet.name}:${packet.id}"))
        assertFalse(sut.canUpdatePacketReadRoles(ops, packet.name))
    }

    @Test
    fun `canUpdatePacketReadRoles returns false with packetId when lacks proper authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:${packet.name}:randomId"))
        assertFalse(sut.canUpdatePacketReadRoles(ops, packet.name, packet.id))
    }
}
