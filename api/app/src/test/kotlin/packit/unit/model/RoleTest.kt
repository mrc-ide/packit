package packit.unit.model

import packit.model.*
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class RoleTest
{
    @Test
    fun `toDto returns correct RoleDto for given Role`()
    {
        val user = User("user1", mutableListOf(), false, "source1", "displayName", id = UUID.randomUUID())
        val role = Role("role1", users = mutableListOf(user), id = 1)
        val permission = Permission("permission1", "d1")
        val tag = Tag("tag1", id = 1)
        val rolePermission = RolePermission(role, permission, tag = tag, id = 1)
        role.rolePermissions = mutableListOf(rolePermission)

        val roleDto = role.toDto()

        assertEquals("role1", roleDto.name)
        assertEquals(1, roleDto.id)
        assertEquals("permission1", roleDto.rolePermissions.first().permission)
        assertEquals("user1", roleDto.users.first().username)
        assertEquals("tag1", roleDto.rolePermissions.first().tag!!.name)
        assertEquals(1, roleDto.rolePermissions.first().tag!!.id)
    }
}