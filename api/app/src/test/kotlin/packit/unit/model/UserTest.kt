package packit.unit.model

import packit.model.*
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class UserTest {
    @Test
    fun `toBasicDto returns correct UserBasicDto for given User`() {
        val role = Role("role1")
        val user = User("user1", mutableListOf(role), false, "source1", "displayName1", id = UUID.randomUUID())
        val basicUserDto = user.toBasicDto()
        assertEquals("user1", basicUserDto.username)
        assertEquals(user.id, basicUserDto.id)
    }

    @Test
    fun `toDto returns correct UserDto for given User`() {
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
    fun `isServiceUser works`() {
        val serviceUser = User("SERVICE", disabled = false, userSource = "service", displayName = null)
        val basicUser = User("user", disabled = false, userSource = "basic", displayName = null)

        assertTrue(serviceUser.isServiceUser())
        assertFalse(basicUser.isServiceUser())
    }

    @Test
    fun `toUserWithPermissions returns correct UserWithPermissions for given User`() {
        val role1 = Role("role1", id = 1, isUsername = false).apply {
            rolePermissions = mutableListOf(RolePermission(this, Permission("permission1", "desc1", id = 1), id = 1))
        }

        val username = "username"
        val usernameRole = Role(username, id = 2, isUsername = true).apply {
            rolePermissions = mutableListOf(RolePermission(this, Permission("permission2", "desc2", id = 1), id = 2))
        }

        val basicUser = User(
            username,
            disabled = false,
            userSource = "basic",
            displayName = "user display name",
            email = "user@gmail.com",
            roles = mutableListOf(role1, usernameRole),
            id = UUID.randomUUID()
        )

        val userWithPermissions = basicUser.toUserWithPermissions()

        assertEquals(basicUser.username, userWithPermissions.username)
        assertEquals(basicUser.displayName, userWithPermissions.displayName)
        assertEquals(basicUser.email, userWithPermissions.email)
        assertEquals(basicUser.id, userWithPermissions.id)
        assertEquals(
            listOf(role1.toBasicDto()),
            userWithPermissions.roles
        )
        assertEquals(
            listOf(
                usernameRole.rolePermissions.first().toDto()
            ),
            userWithPermissions.specificPermissions
        )
    }
}
