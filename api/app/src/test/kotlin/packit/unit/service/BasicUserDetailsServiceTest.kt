package packit.unit.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.core.userdetails.UserDetails
import packit.model.User
import packit.security.profile.UserPrincipal
import packit.service.BasicUserDetailsService
import packit.service.UserService
import java.time.Instant
import java.util.*
import kotlin.test.Test
import kotlin.test.assertTrue

class BasicUserDetailsServiceTest
{
    private val mockUserService = mock<UserService>()
    private val service = BasicUserDetailsService(mockUserService)
    private val mockUser = User(
        "username",
        mutableListOf(),
        false,
        "basic",
        "displayName",
        "email",
        "password",
        Instant.now(),
        UUID.randomUUID()
    )

    private val mockUserPrincipal = UserPrincipal(
        "username",
        "displayName",
        mutableListOf(),
        mutableMapOf()
    )

    @Test
    fun `loadUserByUsername returns correct UserDetails for valid username`()
    {
        whenever(mockUserService.getUserForBasicLogin(mockUser.username)).thenReturn(
            mockUser
        )
        whenever(mockUserService.getUserPrincipal(mockUser)).thenReturn(mockUserPrincipal)
        val userDetails: UserDetails = service.loadUserByUsername(mockUser.username)

        assertEquals(mockUserPrincipal.name, userDetails.username)
        assertEquals(mockUserPrincipal.authorities, userDetails.authorities)
        assertEquals(mockUser.password, userDetails.password)
        assertTrue { userDetails.isEnabled }
    }
}
