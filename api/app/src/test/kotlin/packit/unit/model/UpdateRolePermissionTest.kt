package packit.unit.model

import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import packit.model.dto.UpdatePacketReadRoles
import packit.model.dto.UpdateRolePermission
import kotlin.test.Test
import kotlin.test.assertEquals

class UpdateRolePermissionTest
{
    @Test
    fun `UpdateRolePermission constructor throws when more than one field is non-null`()
    {
        assertThrows<IllegalArgumentException> {
            UpdateRolePermission("permission", "packetId", 1, 1)
        }
    }

    @Test
    fun `UpdateRolePermission constructor does not throw when all fields are null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", null, null, null)
        }
    }

    @Test
    fun `UpdateRolePermission constructor does not throw when only packetId is non-null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", "packetId", null, null)
        }
    }

    @Test
    fun `UpdateRolePermission constructor does not throw when only tagId is non-null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", null, 1, null)
        }
    }

    @Test
    fun `UpdateRolePermission constructor does not throw when only packetGroupId is non-null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", null, null, 1)
        }
    }

    @Test
    fun `UpdatePacketReadRoles constructor throws when both fields are null`()
    {
        assertThrows<IllegalArgumentException> {
            UpdatePacketReadRoles(null, null)
        }
    }

    @Test
    fun `UpdatePacketReadRoles constructor throws when both fields are non-null`()
    {
        assertThrows<IllegalArgumentException> {
            UpdatePacketReadRoles("packet123", 456)
        }
    }

    @Test
    fun `UpdatePacketReadRoles constructor does not throw when only packetId is non-null`()
    {
        assertDoesNotThrow {
            UpdatePacketReadRoles("packet123", null)
        }
    }

    @Test
    fun `UpdatePacketReadRoles constructor does not throw when only packetGroupId is non-null`()
    {
        assertDoesNotThrow {
            UpdatePacketReadRoles(null, 123)
        }
    }

    @Test
    fun `UpdatePacketReadRoles constructor preserves roleNamesToAdd values`()
    {
        val roles = setOf("admin", "user")
        val result = UpdatePacketReadRoles("packet123", null, roles)
        assertEquals(roles, result.roleNamesToAdd)
    }

    @Test
    fun `UpdatePacketReadRoles constructor preserves roleNamesToRemove values`()
    {
        val roles = setOf("guest", "viewer")
        val result = UpdatePacketReadRoles(null, 123, roleNamesToRemove = roles)
        assertEquals(roles, result.roleNamesToRemove)
    }
}
