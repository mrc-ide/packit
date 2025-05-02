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
import packit.security.BasePermissionChecker
import packit.security.ott.OTTAuthenticationToken
import packit.service.BasePermissionService
import packit.service.PacketService
import java.time.Instant
import java.util.*
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
    private var permissionChecker = BasePermissionChecker(permissionService)


    private val sut = AuthorizationLogic(packetService, permissionChecker)

    private fun createOps(authorities: List<String>): SecurityExpressionOperations
    {
        val token = TestingAuthenticationToken("", "", authorities.map { SimpleGrantedAuthority(it) })
        return object : SecurityExpressionRoot(token)
        {}
    }

    private fun createOttOps(
        ottId: UUID,
        packetId: String,
        filePaths: List<String>,
        expiresAt: Instant,
    ): SecurityExpressionOperations
    {
        val token = OTTAuthenticationToken(ottId, packetId, filePaths, expiresAt)
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
    fun `canReadPacket returns true if has user manage authority`()
    {
        val ops = createOps(listOf("user.manage"))
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
        assertTrue(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has user manage authority`()
    {
        val ops = createOps(listOf("user.manage"))
        assertTrue(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packet read authority`()
    {
        val ops = createOps(listOf("packet.read:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packetGroup read authority`()
    {
        val ops = createOps(listOf("packet.read:packetGroup:${packet.name}"))
        assertTrue(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has global manage authority`()
    {
        val ops = createOps(listOf("packet.manage"))
        assertTrue(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns true if has packetGroup manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packetGroup:${packet.name}"))
        assertTrue(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns false if has no authority`()
    {
        val ops = createOps(emptyList())
        assertFalse(sut.canViewPacketGroup(ops, packet.name))
    }

    @Test
    fun `canReadPacketGroup returns false if has authority for different group`()
    {
        val ops = createOps(emptyList())
        assertFalse(sut.canViewPacketGroup(ops, "test2"))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true if has global packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.id))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true if has user manage authority`()
    {
        val ops = createOps(listOf("user.manage"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.id))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true with packetId when has specific packet manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packet:${packet.name}:${packet.id}"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.id))
    }

    @Test
    fun `canUpdatePacketReadRoles returns true with packetId when has packetGroup manage authority`()
    {
        val ops = createOps(listOf("packet.manage:packetGroup:${packet.name}"))
        assertTrue(sut.canUpdatePacketReadRoles(ops, packet.id))
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
        assertFalse(sut.canUpdatePacketReadRoles(ops, packet.id))
    }

    @Test
    fun `oneTimeTokenValid returns true if token has correct permissions and is not expired`()
    {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertTrue(sut.oneTimeTokenValid(ops, packet.id, permittedPaths))
    }

    @Test
    fun `oneTimeTokenValid returns false if token is expired`()
    {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().minusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, packet.id, permittedPaths))
    }

    @Test
    fun `oneTimeTokenValid returns false if requested file paths include extra files`()
    {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, packet.id, listOf("file1", "file2", "file3")))
    }

    @Test
    fun `oneTimeTokenValid returns false if requested file paths do not match permitted file paths`()
    {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, packet.id, listOf("file1", "notMyFile")))
    }

    @Test
    fun `oneTimeTokenValid returns false if requested packet id does not match permitted packet id`()
    {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, "differentPacket", permittedPaths))
    }
}
