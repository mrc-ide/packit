package packit.unit.model

import packit.model.Role
import packit.model.User
import packit.model.toBasicDto
import packit.model.toDto
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
}
