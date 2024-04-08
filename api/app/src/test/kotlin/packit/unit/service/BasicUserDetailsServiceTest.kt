import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.core.userdetails.UserDetails
import packit.exceptions.PackitException
import packit.model.User
import packit.repository.UserRepository
import packit.service.BasicUserDetailsService
import kotlin.test.Test

class BasicUserDetailsServiceTest
{
    private val mockUserRepository = mock<UserRepository>()
    private val service = BasicUserDetailsService(mockUserRepository)
    private val mockUser = User(
        "id",
        "username",
        "email",
        "displayName",
        listOf(),
        false,
        "password",
        "userSource",
        "lastLoggedIn"
    )

    @Test
    fun `loadUserByUsername returns correct UserDetails for valid username`()
    {
        whenever(mockUserRepository.findByUsername(mockUser.username)).thenReturn(
            mockUser
        )
        val userDetails: UserDetails = service.loadUserByUsername(mockUser.username)

        assertEquals(mockUser.username, userDetails.username)
        assertEquals(mockUser.password, userDetails.password)
        assertTrue(userDetails.isEnabled)
    }

    @Test
    fun `loadUserByUsername throws PacketException if repository does not return user`()
    {
        val invalidUsername = "invalid@example.com"
        whenever(mockUserRepository.findByUsername(invalidUsername)).thenReturn(null)
        assertThrows<PackitException> {
            service.loadUserByUsername(invalidUsername)
        }
    }
}
