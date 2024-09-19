package packit.unit.model

import packit.model.*
import packit.model.dto.*
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class UserTest
{
    @Test
    fun `toBasicDto returns correct UserBasicDto for given User`()
    {
        val role = Role("role1")
        val user = User("user1", mutableListOf(role), false, "source1", "displayName1", id = UUID.randomUUID())
        val basicUserDto = user.toBasicDto()
        assertEquals("user1", basicUserDto.username)
        assertEquals(user.id, basicUserDto.id)
    }

    @Test
    fun `toDto returns correct UserDto for given User`()
    {
        val roles = mutableListOf(Role("role1", id = 1), Role("role2", id = 2))
        val user =
            User("user1", roles, false, "source1", "displayName1", email = "random@gmail.com", id = UUID.randomUUID())

        val userDto = user.toDto()

        assertEquals(user.username, userDto.username)
        assertEquals(user.id, userDto.id)
        assertEquals(user.roles.map { it.toBasicDto() }, userDto.roles)
        assertEquals(user.userSource, userDto.userSource)
        assertEquals(user.disabled, userDto.disabled)
        assertEquals(user.displayName, userDto.displayName)
        assertEquals(user.email, userDto.email)
        assertEquals(user.id, userDto.id)
    }

    @Test
    fun `toDto skips the user's username roles`()
    {
        val roles = mutableListOf(Role("role1", id = 1), Role("role2", isUsername = true, id = 2))
        val user = User("user1", roles, false, "source1", "displayName1", id = UUID.randomUUID())

        val userDto = user.toDto()
        assertEquals(userDto.roles, listOf(BasicRoleDto(name = "role1", id = 1)))
    }

    @Test
    fun `toDto includes the user's own role's permissions`()
    {
        val p1 = Permission("permission1", "desc", id = 1)
        val p2 = Permission("permission2", "desc", id = 2)

        val role1 = Role("user1", id = 1, isUsername = true)
        val role2 = Role("role2", id = 2)

        role1.rolePermissions = mutableListOf(RolePermission(role1, p1, id = 3))
        role2.rolePermissions = mutableListOf(RolePermission(role1, p2, id = 4))

        val user = User(
            "user1",
            roles = mutableListOf(role1, role2),
            userSource = "source1",
            userRole = role1,
            id = UUID.randomUUID()
        )
        val userDto = user.toDto()

        assertEquals(
            userDto.specificPermissions,
                     listOf(RolePermissionDto("permission1", id = 3))
        )
    }

    @Test
    fun `list toDto returns users sorted by name`()
    {
        val users = listOf(
            User("userB", userSource = "source", id = UUID.randomUUID()),
            User("userA", userSource = "source", id = UUID.randomUUID()),
            User("userC", userSource = "source", id = UUID.randomUUID()),
        )
        assertEquals(
            users.toDto().map { it.username },
            listOf("userA", "userB", "userC")
        )
        assertEquals(
            users.toBasicDto().map { it.username },
            listOf("userA", "userB", "userC")
        )
    }
}
