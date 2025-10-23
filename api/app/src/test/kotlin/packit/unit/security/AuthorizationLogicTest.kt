package packit.unit.security

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.access.expression.SecurityExpressionOperations
import org.springframework.security.access.expression.SecurityExpressionRoot
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.exceptions.PackitException
import packit.model.Packet
import packit.security.AuthorizationLogic
import packit.security.PermissionChecker
import packit.security.ott.OTTAuthenticationToken
import packit.service.PacketService
import java.time.Instant
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class AuthorizationLogicTest {
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

    private var packetService = mock<PacketService> {
        on { getPacket(packet.id) } doReturn packet
    }

    private val permissionChecker = mock<PermissionChecker> {
        on { canReadPacket(any(), any(), any()) } doReturn true
        on { canReadPacketGroup(any(), any()) } doReturn true
        on { canReadAnyPacketInGroup(any(), any()) } doReturn true
        on { canManagePacket(any(), any(), any()) } doReturn true
        on { canReadAnyPacketInGroup(any(), any()) } doReturn true
    }

    private val sut = AuthorizationLogic(packetService, permissionChecker)

    private val authorities = listOf("packet.manage", "packet.read")
    private val ops: SecurityExpressionOperations = object : SecurityExpressionRoot(
        TestingAuthenticationToken("", "", authorities.map { SimpleGrantedAuthority(it) })
    ) {}

    private fun createOttOps(
        ottId: UUID,
        packetId: String,
        filePaths: List<String>,
        expiresAt: Instant,
    ): SecurityExpressionOperations {
        val token = OTTAuthenticationToken(ottId, packetId, filePaths, expiresAt)
        return object : SecurityExpressionRoot(token) {}
    }

    @Test
    fun `getAuthorities converts operations to a list of strings`() {
        val result = sut.getAuthorities(ops)
        assertEquals(result, authorities)
    }

    @Test
    fun `canReadPacket with full packet returns result from PermissionChecker call`() {
        val result = sut.canReadPacket(ops, packet)

        assertTrue(result)
        verify(permissionChecker).canReadPacket(authorities, packet.name, packet.id)
    }

    @Test
    fun `canReadPacket with packet id returns result from PermissionChecker call`() {
        val result = sut.canReadPacket(ops, packet.id)

        assertTrue(result)
        verify(permissionChecker).canReadPacket(authorities, packet.name, packet.id)
    }

    @Test
    fun `canReadPacket throws AccessDeniedException when packet not found`() {
        val ex = PackitException("Packet not found")
        given { packetService.getPacket(packet.id) }.willAnswer { throw ex }

        assertThrows<AccessDeniedException> {
            sut.canReadPacket(ops, packet.id)
        }.apply {
            assertEquals("Access Denied", message)
            assertEquals(ex, cause)
        }
        verify(permissionChecker, never()).canReadPacket(any(), any(), any())
    }

    @Test
    fun `canViewPacketGroup returns true when user can read packet group`() {
        val result = sut.canViewPacketGroup(ops, "testGroup")

        assertTrue(result)
        verify(permissionChecker).canReadPacketGroup(authorities, "testGroup")
    }

    @Test
    fun `canViewPacketGroup returns true when user can read any packet in group`() {
        whenever(permissionChecker.canReadPacketGroup(authorities, "testGroup")).thenReturn(false)

        val result = sut.canViewPacketGroup(ops, "testGroup")

        assertTrue(result)
        verify(permissionChecker).canReadPacketGroup(authorities, "testGroup")
        verify(permissionChecker).canReadAnyPacketInGroup(authorities, "testGroup")
    }

    @Test
    fun `canUpdatePacketReadRoles returns true when user can manage packet`() {
        val result = sut.canUpdatePacketReadRoles(ops, packet.id)

        assertTrue(result)
        verify(permissionChecker).canManagePacket(authorities, packet.name, packet.id)
        verify(packetService).getPacket(packet.id)
    }

    @Test
    fun `canUpdatePacketReadRoles throws AccessDeniedException when packet not found`() {
        val ex = PackitException("Packet not found")
        given { packetService.getPacket(packet.id) }.willAnswer { throw ex }

        assertThrows<AccessDeniedException> {
            sut.canUpdatePacketReadRoles(ops, packet.id)
        }.apply {
            assertEquals("Access Denied", message)
            assertEquals(ex, cause)
        }
        verify(permissionChecker, never()).canManagePacket(any(), any(), any())
    }

    @Test
    fun `oneTimeTokenValid returns true if token has correct permissions and is not expired`() {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertTrue(sut.oneTimeTokenValid(ops, packet.id, permittedPaths))
    }

    @Test
    fun `oneTimeTokenValid returns false if token is expired`() {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().minusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, packet.id, permittedPaths))
    }

    @Test
    fun `oneTimeTokenValid returns false if requested file paths include extra files`() {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, packet.id, listOf("file1", "file2", "file3")))
    }

    @Test
    fun `oneTimeTokenValid returns false if requested file paths do not match permitted file paths`() {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, packet.id, listOf("file1", "notMyFile")))
    }

    @Test
    fun `oneTimeTokenValid returns false if requested packet id does not match permitted packet id`() {
        val permittedPaths = listOf("file1", "file2")
        val ops = createOttOps(UUID.randomUUID(), packet.id, permittedPaths, Instant.now().plusSeconds(10))

        assertFalse(sut.oneTimeTokenValid(ops, "differentPacket", permittedPaths))
    }
}
