package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.security.oauth2.core.user.OAuth2User
import packit.security.oauth2.OAuth2UserService
import packit.security.profile.UserPrincipal
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class OAuth2UserServiceTest
{
    @Test
    fun `can process oauth user attributes`()
    {
        val fakeEmail = "test@example.com"
        val fakeName = "Jammy"

        val mockOAuth2User = mock<OAuth2User> {
            on { attributes } doReturn mapOf("email" to fakeEmail, "name" to fakeName)
        }

        val sut = OAuth2UserService()

        val result = sut.processOAuth2User(mockOAuth2User)

        assertTrue(result is UserPrincipal)

        assertEquals(result.username, fakeEmail)

        assertEquals(result.name, fakeName)
    }
}
