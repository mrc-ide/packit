import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.assertThrows
import org.springframework.security.core.userdetails.UserDetails
import packit.exceptions.PackitException
import packit.service.BasicUserDetailsService
import kotlin.test.Test

class BasicUserDetailsServiceTest
{

    private val service = BasicUserDetailsService()

    @Test
    fun `loadUserByUsername returns correct UserDetails for valid username`()
    {
        val username = BasicUserDetailsService.USERNAME

        val userDetails: UserDetails = service.loadUserByUsername(username)

        assertEquals(username, userDetails.username)
        assertEquals(BasicUserDetailsService.PASSWORD, userDetails.password)
        assertTrue(userDetails.isEnabled)
    }

    @Test
    fun `loadUserByUsername throws PackitException for invalid username`()
    {
        val invalidUsername = "invalid@example.com"

        assertThrows<PackitException> {
            service.loadUserByUsername(invalidUsername)
        }
    }
}
