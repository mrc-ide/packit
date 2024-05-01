package packit.unit.model

import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.model.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals

class RolePermissionTest
{
    private val mockRoles = listOf(
        Role("role1"),
        Role("role2"),
    )
    private val mockPermissions = listOf(
        Permission("permission1", description = "d1"),
        Permission("permission2", description = "d2"),
    )

    @Test
    fun `equals returns true when comparing same instance`()
    {
        val rolePermission = RolePermission(mockRoles.first(), mockPermissions.first())
        assertEquals(rolePermission, rolePermission)
    }

    @Test
    fun `equals returns false when comparing with non RolePermission instance`()
    {
        val rolePermission = RolePermission(mockRoles.first(), mockPermissions.first())
        assertFalse(rolePermission.equals("not a RolePermission"))
    }

    @Test
    fun `equals returns false when role names are different`()
    {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.last(), mockPermissions.first())
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when permission names are different`()
    {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.last())
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns true when all properties are equal`()
    {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.first())
        assertEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when packet ids are different`()
    {

        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2024111" })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2023344" })
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when packetGroup ids are different`()
    {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `equals returns false when tag ids are different`()
    {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1, rolePermission2)
    }

    @Test
    fun `hashCode returns same hashcode for identical RolePermission instances`()
    {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.first())
        assertEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different roles`()
    {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.last(), mockPermissions.first())
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different permissions`()
    {
        val rolePermission1 = RolePermission(mockRoles.first(), mockPermissions.first())
        val rolePermission2 = RolePermission(mockRoles.first(), mockPermissions.last())
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different packets`()
    {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2024111" })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), mock<Packet> { on { id } doReturn "2023344" })
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different packetGroups`()
    {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, mock<PacketGroup> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }

    @Test
    fun `hashCode returns different hash codes for RolePermission instances with different tags`()
    {
        val rolePermission1 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 1 })
        val rolePermission2 =
            RolePermission(mockRoles.first(), mockPermissions.first(), null, null, mock<Tag> { on { id } doReturn 2 })
        assertNotEquals(rolePermission1.hashCode(), rolePermission2.hashCode())
    }
}
