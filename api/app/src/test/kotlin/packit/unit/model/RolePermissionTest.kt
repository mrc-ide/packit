package packit.unit.model

import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.model.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals

class RolePermissionTest {
    private val mockRoles = listOf(
        Role("role1"),
        Role("role2"),
    )
    private val mockPermissions = listOf(
        Permission("permission1", description = "d1"),
        Permission("permission2", description = "d2"),
    )

    @Test
    fun `equals returns true when comparing same instance`() {
        val rolePermission = RolePermission(mockRoles.first(), mockPermissions.first())
        assertEquals(rolePermission, rolePermission)
    }

    @Test
    fun `equals returns false when comparing with non RolePermission instance`() {
        val rolePermission = RolePermission(mockRoles.first(), mockPermissions.first())
        assertFalse(rolePermission.equals("not a RolePermission"))
    }

    @Test
    fun `equals returns false when role names are different`() {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.last(), mockPermissions.first())
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when permission names are different`() {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.last())
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns true when all properties are equal`() {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.first())
        assertEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when packet ids are different`() {

        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2024111" })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2023344" })
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when packetGroup ids are different`() {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when tag ids are different`() {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `hashCode returns same hashcode for identical RolePermission instances`() {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.first())
        assertEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different roles`() {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.last(), mockPermissions.first())
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different permissions`() {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.last())
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different packets`() {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2024111" })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2023344" })
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different packetGroups`() {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different tags`() {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `constructor throws when more than one scope field is non-null`() {
        assertThrows<IllegalArgumentException> {
            RolePermission(Role("r1"), Permission("p1", "d1"), mock<Packet>(), mock<PacketGroup>())
        }
    }

    @Test
    fun `constructor does not throw when all scope fields are null`() {
        assertDoesNotThrow {
            RolePermission(Role("r1"), Permission("p1", "d1"))
        }
    }

    @Test
    fun `constructor does not throw when only single scope field is non-null`() {
        assertDoesNotThrow {
            RolePermission(Role("r1"), Permission("p1", "d1"), mock<Packet>())
        }
    }

    @Test
    fun `toDto returns correct RolePermissionDto for given RolePermission`() {
        val permission = Permission("permission1", "d1")
        val tag = Tag("tag1", id = 1)
        val rolePermission = RolePermission(Role("roleName"), permission, tag = tag, id = 1)

        val rolePermissionDto = rolePermission.toDto()

        assertEquals("permission1", rolePermissionDto.permission)
        assertEquals("tag1", rolePermissionDto.tag!!.name)
        assertEquals(1, rolePermissionDto.tag!!.id)
        assertEquals(1, rolePermissionDto.id)
    }
}
