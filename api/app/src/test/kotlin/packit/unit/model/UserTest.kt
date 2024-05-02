package packit.unit.model

import packit.model.Role
import packit.model.User
import packit.model.toDto
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class UserTest
{
    @Test
    fun `toDto returns correct UserDto for given User`()
    {
        val role = Role("role1")
        val user = User("user1", mutableListOf(role), false, "source1", "displayName1", id = UUID.randomUUID())
        val userDto = user.toDto()
        assertEquals("user1", userDto.username)
        assertEquals(user.id, userDto.id)
    }
}