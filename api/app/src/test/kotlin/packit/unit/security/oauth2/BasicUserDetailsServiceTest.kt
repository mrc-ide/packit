package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.exceptions.PackitException
import packit.model.User
import packit.security.Role
import packit.security.oauth2.BasicUserDetailsService
import packit.security.profile.UserPrincipal
import packit.service.UserService
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class BasicUserDetailsServiceTest
{
    @Test
    fun `can load user details`()
    {
        val userEmail = "test@example.com"

        val user = User(
            1L,
            userEmail,
            "test", Role.USER,
            "test", mutableMapOf()
        )

        val mockUserService = mock<UserService> {
            on { findByEmail(userEmail) } doReturn Optional.of(user)
        }

        val sut = BasicUserDetailsService(mockUserService)

        val result = sut.loadUserByUsername(userEmail)

        assertTrue(result is UserPrincipal)

        assertEquals(result.username, userEmail)
    }

    @Test
    fun `throws PackitException when user does not exist`()
    {
        val userEmail = "test@example.com"
        val differentEmail = "user@example.com"

        val user = User(
            1L,
            userEmail,
            "test", Role.USER,
            "test", mutableMapOf()
        )

        val mockUserService = mock<UserService> {
            on { findByEmail(differentEmail) } doReturn Optional.of(user)
        }

        val sut = BasicUserDetailsService(mockUserService)

        assertThrows<PackitException> { sut.loadUserByUsername(userEmail) }
    }
}
