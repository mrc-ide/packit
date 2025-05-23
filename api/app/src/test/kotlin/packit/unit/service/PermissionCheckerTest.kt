package packit.unit.service

import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import packit.security.BasePermissionChecker
import packit.service.PermissionService
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PermissionCheckerTest {
    private val permissionService = mock<PermissionService> {
        on {
            buildScopedPermission(
                eq("packet.manage"),
                any(),
                eq(null),
                eq(null)
            )
        } doReturn "packet.manage:packet:group1"
        on {
            buildScopedPermission(
                eq("packet.manage"),
                eq("group1"),
                any(),
                eq(null)
            )
        } doReturn "packet.manage:packet:group1:packet1"
        on { buildScopedPermission(eq("packet.read"), any(), eq(null), eq(null)) } doReturn "packet.read:packet:group1"
        on {
            buildScopedPermission(
                eq("packet.read"),
                eq("group1"),
                any(),
                eq(null)
            )
        } doReturn "packet.read:packet:group1:packet1"
    }
    private val permissionChecker = BasePermissionChecker(permissionService)

    @Nested
    inner class GlobalPermissions {

        @Test
        fun hasUserManagePermission() {
            assertTrue(permissionChecker.hasUserManagePermission(listOf("user.manage")))
            assertFalse(permissionChecker.hasUserManagePermission(listOf("other.permission")))
            assertFalse(permissionChecker.hasUserManagePermission(emptyList()))
        }

        @Test
        fun hasGlobalPacketManagePermission() {
            assertTrue(permissionChecker.hasGlobalPacketManagePermission(listOf("packet.manage")))
            assertFalse(permissionChecker.hasGlobalPacketManagePermission(listOf("other.permission")))
            assertFalse(permissionChecker.hasGlobalPacketManagePermission(emptyList()))
        }

        @Test
        fun hasGlobalReadPermission() {
            assertTrue(permissionChecker.hasGlobalReadPermission(listOf("packet.read")))
            assertFalse(permissionChecker.hasGlobalReadPermission(listOf("other.permission")))
            assertFalse(permissionChecker.hasGlobalReadPermission(emptyList()))
        }
    }

    @Nested
    inner class ManagePacketsPermissions {

        @Test
        fun canManageAllPacketsWithUserManage() {
            assertTrue(permissionChecker.canManageAllPackets(listOf("user.manage")))
        }

        @Test
        fun canManageAllPacketsWithGlobalPacketManage() {
            assertTrue(permissionChecker.canManageAllPackets(listOf("packet.manage")))
        }

        @Test
        fun cannotManageAllPacketsWithoutProperPermissions() {
            assertFalse(permissionChecker.canManageAllPackets(listOf("other.permission")))
            assertFalse(permissionChecker.canManageAllPackets(emptyList()))
        }

        @Test
        fun hasPacketManagePermissionForGroup() {
            assertTrue(
                permissionChecker.hasPacketManagePermissionForGroup(
                    listOf("packet.manage:packet:group1"), "group1"
                )
            )
            assertFalse(
                permissionChecker.hasPacketManagePermissionForGroup(
                    listOf("other.permission"), "group1"
                )
            )
        }

        @Test
        fun canManagePacketGroupWithGlobalPermission() {
            assertTrue(permissionChecker.canManagePacketGroup(listOf("user.manage"), "group1"))
            assertTrue(permissionChecker.canManagePacketGroup(listOf("packet.manage"), "group1"))
        }

        @Test
        fun canManagePacketGroupWithGroupPermission() {
            assertTrue(
                permissionChecker.canManagePacketGroup(
                    listOf("packet.manage:packet:group1"), "group1"
                )
            )
        }

        @Test
        fun hasPacketManagePermissionForPacket() {
            assertTrue(
                permissionChecker.hasPacketManagePermissionForPacket(
                    listOf("packet.manage:packet:group1:packet1"), "group1", "packet1"
                )
            )
            assertFalse(
                permissionChecker.hasPacketManagePermissionForPacket(
                    listOf("other.permission"), "group1", "packet1"
                )
            )
        }

        @Test
        fun canManagePacketWithGlobalPermission() {
            assertTrue(permissionChecker.canManagePacket(listOf("user.manage"), "group1", "packet1"))
            assertTrue(permissionChecker.canManagePacket(listOf("packet.manage"), "group1", "packet1"))
        }

        @Test
        fun canManagePacketWithGroupPermission() {
            assertTrue(
                permissionChecker.canManagePacket(
                    listOf("packet.manage:packet:group1"), "group1", "packet1"
                )
            )
        }

        @Test
        fun canManagePacketWithPacketPermission() {
            assertTrue(
                permissionChecker.canManagePacket(
                    listOf("packet.manage:packet:group1:packet1"), "group1", "packet1"
                )
            )
        }

        @ParameterizedTest
        @ValueSource(strings = ["packet.manage:packet:group1:anything", "packet.manage:packet:group1:other"])
        fun canManageAnyPacketInGroup(permission: String) {
            assertTrue(permissionChecker.canManageAnyPacketInGroup(listOf(permission), "group1"))
            assertFalse(permissionChecker.canManageAnyPacketInGroup(listOf("other.permission"), "group1"))
        }

        @Test
        fun hasAnyPacketManagePermission() {
            assertTrue(permissionChecker.hasAnyPacketManagePermission(listOf("packet.manage")))
            assertTrue(permissionChecker.hasAnyPacketManagePermission(listOf("packet.manage:packet:group1")))
            assertTrue(permissionChecker.hasAnyPacketManagePermission(listOf("packet.manage:packet:group1:packet1")))
            assertFalse(permissionChecker.hasAnyPacketManagePermission(listOf("other.permission")))
        }
    }

    @Nested
    inner class ReadPacketsPermissions {

        @Test
        fun canReadAllPacketsWithUserManage() {
            assertTrue(permissionChecker.canReadAllPackets(listOf("user.manage")))
        }

        @Test
        fun canReadAllPacketsWithGlobalPacketManage() {
            assertTrue(permissionChecker.canReadAllPackets(listOf("packet.manage")))
        }

        @Test
        fun canReadAllPacketsWithGlobalReadPermission() {
            assertTrue(permissionChecker.canReadAllPackets(listOf("packet.read")))
        }

        @Test
        fun hasPacketReadPermissionForGroup() {
            assertTrue(
                permissionChecker.hasPacketReadPermissionForGroup(
                    listOf("packet.read:packet:group1"), "group1"
                )
            )
            assertFalse(
                permissionChecker.hasPacketReadPermissionForGroup(
                    listOf("other.permission"), "group1"
                )
            )
        }

        @Test
        fun canReadPacketGroupWithGlobalPermission() {
            assertTrue(permissionChecker.canReadPacketGroup(listOf("user.manage"), "group1"))
            assertTrue(permissionChecker.canReadPacketGroup(listOf("packet.manage"), "group1"))
            assertTrue(permissionChecker.canReadPacketGroup(listOf("packet.read"), "group1"))
        }

        @Test
        fun canReadPacketGroupWithGroupManagePermission() {
            assertTrue(
                permissionChecker.canReadPacketGroup(
                    listOf("packet.manage:packet:group1"), "group1"
                )
            )
        }

        @Test
        fun canReadPacketGroupWithGroupReadPermission() {
            assertTrue(
                permissionChecker.canReadPacketGroup(
                    listOf("packet.read:packet:group1"), "group1"
                )
            )
        }

        @Test
        fun canReadAnyPacketInGroup() {
            assertTrue(
                permissionChecker.canReadAnyPacketInGroup(
                    listOf("packet.read:packet:group1:anything"), "group1"
                )
            )
            assertTrue(
                permissionChecker.canReadAnyPacketInGroup(
                    listOf("packet.manage:packet:group1:anything"), "group1"
                )
            )
            assertFalse(
                permissionChecker.canReadAnyPacketInGroup(
                    listOf("other.permission"), "group1"
                )
            )
        }

        @Test
        fun hasPacketReadPermissionForPacket() {
            assertTrue(
                permissionChecker.hasPacketReadPermissionForPacket(
                    listOf("packet.read:packet:group1:packet1"), "group1", "packet1"
                )
            )
            assertFalse(
                permissionChecker.hasPacketReadPermissionForPacket(
                    listOf("other.permission"), "group1", "packet1"
                )
            )
        }

        @Test
        fun canReadPacketWithGlobalPermission() {
            assertTrue(permissionChecker.canReadPacket(listOf("user.manage"), "group1", "packet1"))
            assertTrue(permissionChecker.canReadPacket(listOf("packet.manage"), "group1", "packet1"))
            assertTrue(permissionChecker.canReadPacket(listOf("packet.read"), "group1", "packet1"))
        }

        @Test
        fun canReadPacketWithGroupPermission() {
            assertTrue(
                permissionChecker.canReadPacket(
                    listOf("packet.manage:packet:group1"), "group1", "packet1"
                )
            )
            assertTrue(
                permissionChecker.canReadPacket(
                    listOf("packet.read:packet:group1"), "group1", "packet1"
                )
            )
        }

        @Test
        fun canReadPacketWithPacketPermission() {
            assertTrue(
                permissionChecker.canReadPacket(
                    listOf("packet.manage:packet:group1:packet1"), "group1", "packet1"
                )
            )
            assertTrue(
                permissionChecker.canReadPacket(
                    listOf("packet.read:packet:group1:packet1"), "group1", "packet1"
                )
            )
        }
    }
}
