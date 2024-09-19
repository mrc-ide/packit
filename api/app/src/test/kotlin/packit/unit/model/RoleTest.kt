package packit.unit.model

import packit.model.*
import packit.model.dto.*
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

class RoleTest
{
    @Test
    fun `toDto returns correct RoleDto for given Role`()
    {
        val user = User("user1", userSource = "source1", id = UUID.randomUUID())
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

    @Test
    fun `toBasicDto returns correct BasicDto for given Role`()
    {
        val role = Role(name = "testRole", id = 1)

        val basicRoleDto = role.toBasicDto()

        assertEquals(role.name, basicRoleDto.name)
        assertEquals(role.id, basicRoleDto.id)
    }

    @Test
    fun `toDto returns sorted user dtos`()
    {
        val role = Role(
            name = "role1", id = 1,
            users = mutableListOf(
                User("c user", id = UUID.randomUUID(), userSource = "github"),
                User("a user", id = UUID.randomUUID(), userSource = "github"),
                User("b user", id = UUID.randomUUID(), userSource = "github"),
            )
        )

        assertEquals(
            role.toDto().users.map { it.username },
            listOf("a user", "b user", "c user")
        )
    }

    @Test
    fun `list toDto skips username roles`()
    {
        val roles = listOf(
            Role(name = "testRole1", id = 1),
            Role(name = "testRole2", id = 2, isUsername = true),
            Role(name = "testRole3", id = 3),
        )
        assertEquals(
            roles.toDto().map { it.name },
            listOf("testRole1", "testRole3")
        )
        assertEquals(
            roles.toBasicDto().map { it.name },
            listOf("testRole1", "testRole3")
        )
    }

    @Test
    fun `list toDto returns roles sorted by name`()
    {
        val roles = listOf(
            Role(name = "testRoleB", id = 2),
            Role(name = "testRoleA", id = 1),
            Role(name = "testRoleC", id = 3),
        )
        assertEquals(
            roles.toDto().map { it.name },
            listOf("testRoleA", "testRoleB", "testRoleC")
        )
        assertEquals(
            roles.toBasicDto().map { it.name },
            listOf("testRoleA", "testRoleB", "testRoleC")
        )
    }

    @Test
    fun `equals returns true for same Role instances`()
    {
        val role1 = Role("role1", false)
        val role2 = role1

        assertEquals(role1, role2)
    }

    @Test
    fun `equals returns true for Role instances with same properties`()
    {
        val role1 = Role("role1", false)
        val role2 = Role("role1", false)

        assertEquals(role1, role2)
    }

    @Test
    fun `equals returns false for Role instances with different names`()
    {
        val role1 = Role("role1", false)
        val role2 = Role("role2", false)

        assertNotEquals(role1, role2)
    }

    @Test
    fun `equals returns false for Role instances with different isUsername values`()
    {
        val role1 = Role("role1", false)
        val role2 = Role("role1", true)

        assertNotEquals(role1, role2)
    }

    @Test
    fun `hashCode returns same value for Role instances with same properties`()
    {
        val role1 = Role("role1", false)
        val role2 = Role("role1", false)

        assertEquals(role1.hashCode(), role2.hashCode())
    }

    @Test
    fun `hashCode returns different value for Role instances with different properties`()
    {
        val role1 = Role("role1", false)
        val role2 = Role("role2", true)

        assertNotEquals(role1.hashCode(), role2.hashCode())
    }
}
