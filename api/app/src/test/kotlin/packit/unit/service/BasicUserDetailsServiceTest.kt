package packit.unit.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.core.userdetails.UserDetails
import packit.exceptions.PackitException
import packit.model.User
import packit.service.BasicUserDetailsService
import packit.service.UserService
import kotlin.test.Test

class BasicUserDetailsServiceTest
{
    private val mockUserService = mock<UserService>()
    private val service = BasicUserDetailsService(mockUserService)
    private val mockUser = User(
        "username",
        mutableListOf(),
        false,
        "basic",
        "id",
        "displayName",
        "email",
        "password",
        "lastLoggedIn"
    )

    @Test
    fun `loadUserByUsername returns correct UserDetails for valid username`()
    {
        whenever(mockUserService.getUserForLogin(mockUser.username)).thenReturn(
            mockUser
        )
        val userDetails: UserDetails = service.loadUserByUsername(mockUser.username)

        assertEquals(mockUser.username, userDetails.username)
        assertEquals(mockUser.password, userDetails.password)
        assertTrue(userDetails.isEnabled)
    }
    
}
