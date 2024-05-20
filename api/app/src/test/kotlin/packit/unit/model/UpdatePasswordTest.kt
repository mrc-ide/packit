package packit.unit.model

import org.junit.jupiter.api.assertThrows
import packit.model.dto.UpdatePassword
import kotlin.test.Test
import kotlin.test.assertEquals

class UpdatePasswordTest
{
    @Test
    fun `UpdatePassword initialization succeeds when current and new passwords are different`()
    {
        val currentPassword = "currentPassword"
        val newPassword = "newPassword"

        val updatePassword = UpdatePassword(currentPassword, newPassword)

        assertEquals(currentPassword, updatePassword.currentPassword)
        assertEquals(newPassword, updatePassword.newPassword)
    }

    @Test
    fun `UpdatePassword initialization fails when current and new passwords are the same`()
    {
        val currentPassword = "samePassword"
        val newPassword = "samePassword"

        assertThrows<IllegalArgumentException> { UpdatePassword(currentPassword, newPassword) }.apply {
            assertEquals("New password must be different from the current password", message)
        }
    }
}
