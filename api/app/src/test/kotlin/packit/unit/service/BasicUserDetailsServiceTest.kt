package packit.unit.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.core.userdetails.UserDetails
import packit.model.User
import packit.service.BasicUserDetailsService
import packit.service.RoleService
import packit.service.UserService
import java.time.Instant
import java.util.*
import kotlin.test.Test

class BasicUserDetailsServiceTest {
    private val mockUserService = mock<UserService>()
    private val mockRoleService = mock<RoleService>()
    private val service = BasicUserDetailsService(mockUserService, mockRoleService)
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

    @Test
    fun `loadUserByUsername returns correct UserDetails for valid username`() {
        whenever(mockUserService.getUserForBasicLogin(mockUser.username)).thenReturn(
            mockUser
        )
        val userDetails: UserDetails = service.loadUserByUsername(mockUser.username)

        assertEquals(mockUser.username, userDetails.username)
        assertEquals(mockUser.password, userDetails.password)
        assertTrue(userDetails.isEnabled)
    }
}
