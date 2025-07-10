package packit.unit.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.PacketGroupSummary
import packit.repository.PacketGroupRepository
import packit.security.PermissionChecker
import packit.service.BasePacketGroupService
import packit.service.PacketService
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PacketGroupServiceTest {
    private val now = Instant.now().epochSecond.toDouble()
    private val testPacketLatestId = "20190203-120000-1234dada"
    private val test2PacketLatestId = "20190403-120000-1234dfdf"

    private val displayName = "Testable Display Name"
    private val description = "A testable description"
    private val packetMetadata =
        PacketMetadata(
            "3",
            "test",
            mapOf("name" to "value"),
            emptyList(),
            GitMetadata("git", "sha", emptyList()),
            TimeMetadata(
                Instant.now().epochSecond.toDouble(),
                Instant.now().epochSecond.toDouble()
            ),
            mapOf(
                "orderly" to mapOf(
                    "description" to mapOf(
                        "display" to displayName,
                        "long" to description
                    )
                )
            ),
            emptyList()
        )
    private val packets =
        listOf(
            Packet(
                "20240101-090000-4321gaga",
                "test",
                "",
                mapOf("alpha" to 1),
                now,
                now,
                now
            ),
            Packet(
                testPacketLatestId,
                "test",
                "test name (latest display name)",
                mapOf("beta" to 1),
                now,
                now + 100,
                now
            ),
            Packet(
                test2PacketLatestId,
                "test2",
                "Test 2 Display Name",
                mapOf(),
                now,
                now,
                now
            ),
            Packet(
                "20180203-120000-abdefg56",
                "test",
                "test name (old display name)",
                mapOf("name" to "value"),
                now - 50,
                (now - 100),
                now,
            ),
            Packet(
                "20180403-120000-a5bde567",
                "test2",
                "",
                mapOf("beta" to 1),
                now - 60,
                (now - 200),
                now,
            )
        )
    private val packetGroups = listOf(PacketGroup("test"), PacketGroup("test2"))
    private val packetGroupRepository = mock<PacketGroupRepository> {
        on { findAll() } doReturn packetGroups
    }
    private val packetService = mock<PacketService>()
    private val permissionChecker = mock<PermissionChecker>()

    @Test
    fun `getPacketGroups calls repository with correct params and returns its result`() {
        val sut = BasePacketGroupService(packetGroupRepository, packetService, permissionChecker)
        val pageablePayload = PageablePayload(0, 10)
        val filterName = "test"
        val packetGroups = listOf(PacketGroup("test1"), PacketGroup("test2"))
        whenever(
            packetGroupRepository.findAllByNameContaining(
                eq(filterName), any<Sort>()
            )
        ).thenReturn(packetGroups)

        val result = sut.getPacketGroups(pageablePayload, filterName)

        assertEquals(packetGroups, result.content)
        verify(packetGroupRepository).findAllByNameContaining(
            filterName,
            Sort.by("name")
        )
    }

    @Test
    fun `getPacketGroupSummaries returns summaries for packet groups with correct display names`() {
        val expectedPacketGroupSummaries =
            listOf(
                PacketGroupSummary(
                    name = "test",
                    packetCount = 3,
                    latestId = testPacketLatestId,
                    latestTime = now + 100,
                    latestDisplayName = "test name (latest display name)",
                ),
                PacketGroupSummary(
                    name = "test2",
                    packetCount = 2,
                    latestId = test2PacketLatestId,
                    latestTime = now,
                    latestDisplayName = "Test 2 Display Name",
                )
            )
        val pageablePayload = PageablePayload(0, 10)
        whenever(packetService.getByNameOrDisplayName(any())).thenReturn(packets)

        val sut = BasePacketGroupService(packetGroupRepository, packetService, permissionChecker)

        val result = sut.getPacketGroupSummaries(pageablePayload, "")

        assertEquals(expectedPacketGroupSummaries.size, result.totalElements.toInt())
        expectedPacketGroupSummaries.forEachIndexed { i, expected ->
            val actual = result.content[i]
            assertEquals(expected.name, actual.name)
            assertEquals(expected.latestDisplayName, actual.latestDisplayName)
            assertEquals(expected.packetCount, actual.packetCount)
            assertEquals(expected.latestTime, actual.latestTime)
        }
    }

    @Test
    fun `getPacketGroup returns packet group when found in repository`() {
        val packetGroupId = 1
        val expectedPacketGroup = PacketGroup("test")
        whenever(packetGroupRepository.findById(packetGroupId)).thenReturn(Optional.of(expectedPacketGroup))
        val sut = BasePacketGroupService(packetGroupRepository, packetService, permissionChecker)

        val result = sut.getPacketGroup(packetGroupId)

        assertEquals(expectedPacketGroup, result)
        verify(packetGroupRepository).findById(packetGroupId)
    }

    @Test
    fun `getPacketGroup throws PackitException when packet group not found`() {
        val packetGroupId = 999
        whenever(packetGroupRepository.findById(packetGroupId)).thenReturn(Optional.empty())
        val sut = BasePacketGroupService(packetGroupRepository, packetService, permissionChecker)

        assertThrows<PackitException> {
            sut.getPacketGroup(packetGroupId)
        }.apply {
            assertEquals("packetGroupNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
        verify(packetGroupRepository).findById(packetGroupId)
    }

    @Test
    fun `getAllPacketGroupsCanManage filters packet groups when user cannot manage all packets`() {
        // Setup
        val allPacketGroups = listOf(
            PacketGroup("group1"),
            PacketGroup("group2"),
            PacketGroup("group3")
        )
        whenever(packetGroupRepository.findAll()).thenReturn(allPacketGroups)
        val authorities = listOf("MANAGE_GROUP1", "MANAGE_GROUP2")
        setupSecurityContext(authorities)
        whenever(permissionChecker.canManageAllPackets(authorities)).thenReturn(false)
        whenever(permissionChecker.hasPacketManagePermissionForGroup(authorities, "group1")).thenReturn(true)
        whenever(permissionChecker.hasPacketManagePermissionForGroup(authorities, "group2")).thenReturn(true)
        whenever(permissionChecker.hasPacketManagePermissionForGroup(authorities, "group3")).thenReturn(false)

        val sut = BasePacketGroupService(packetGroupRepository, packetService, permissionChecker)

        // Execute
        val result = sut.getAllPacketGroupsCanManage()

        // Verify
        assertEquals(2, result.size)
        assertEquals("group1", result[0].name)
        assertEquals("group2", result[1].name)
        verify(permissionChecker).canManageAllPackets(authorities)
        verify(permissionChecker, times(3)).hasPacketManagePermissionForGroup(any(), any())
    }

    @Test
    fun `getAllPacketGroupsCanManage returns empty list when user has no permissions`() {
        // Setup
        val allPacketGroups = listOf(
            PacketGroup("group1"),
            PacketGroup("group2"),
            PacketGroup("group3")
        )
        whenever(packetGroupRepository.findAll()).thenReturn(allPacketGroups)
        val authorities = listOf("NO_PERMISSIONS")
        setupSecurityContext(authorities)
        whenever(permissionChecker.canManageAllPackets(authorities)).thenReturn(false)
        whenever(permissionChecker.hasPacketManagePermissionForGroup(eq(authorities), any())).thenReturn(false)

        val sut = BasePacketGroupService(packetGroupRepository, packetService, permissionChecker)

        // Execute
        val result = sut.getAllPacketGroupsCanManage()

        // Verify
        assertTrue { result.isEmpty() }
        verify(permissionChecker).canManageAllPackets(authorities)
        verify(permissionChecker, times(3)).hasPacketManagePermissionForGroup(any(), any())
    }

    @Test
    fun `getAllPacketGroupsCanManage handles empty repository result`() {
        // Setup
        whenever(packetGroupRepository.findAll()).thenReturn(emptyList())
        val authorities = listOf("MANAGE_ALL")
        setupSecurityContext(authorities)
        whenever(permissionChecker.canManageAllPackets(authorities)).thenReturn(true)

        val sut = BasePacketGroupService(packetGroupRepository, packetService, permissionChecker)

        // Execute
        val result = sut.getAllPacketGroupsCanManage()

        // Verify
        assertTrue(result.isEmpty())
        verify(permissionChecker).canManageAllPackets(authorities)
        verify(permissionChecker, never()).hasPacketManagePermissionForGroup(any(), any())
    }

    // Helper function to set up security context with specific authorities
    private fun setupSecurityContext(authorities: List<String>) {
        val authentication = mock<Authentication> {
            on { getAuthorities() } doReturn authorities.map { SimpleGrantedAuthority(it) }
        }
        val securityContext = mock<SecurityContext> {
            on { getAuthentication() } doReturn authentication
        }

        SecurityContextHolder.setContext(securityContext)
    }
}
