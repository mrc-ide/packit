package packit.unit.model

import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import packit.model.dto.UpdateRolePermission
import kotlin.test.Test

class UpdateRolePermissionTest
{
    @Test
    fun `constructor throws when more than one field is non-null`()
    {
        assertThrows<IllegalArgumentException> {
            UpdateRolePermission("permission", "packetId", 1, 1)
        }
    }

    @Test
    fun `constructor does not throw when all fields are null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", null, null, null)
        }
    }

    @Test
    fun `constructor does not throw when only packetId is non-null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", "packetId", null, null)
        }
    }

    @Test
    fun `constructor does not throw when only tagId is non-null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", null, 1, null)
        }
    }

    @Test
    fun `constructor does not throw when only packetGroupId is non-null`()
    {
        assertDoesNotThrow {
            UpdateRolePermission("permission", null, null, 1)
        }
    }
}