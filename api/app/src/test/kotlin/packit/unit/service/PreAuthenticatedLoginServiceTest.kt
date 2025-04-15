package packit.unit.service

import kotlin.test.Test
import kotlin.test.assertEquals
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.model.User
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.UserService
import packit.service.PreAuthenticatedLoginService

class PreAuthenticatedLoginServiceTest
{
    @Test
    fun `can save user and issue token`()
    {
        val mockUser = mock<User>()
        val mockUserPrincipal = UserPrincipal("test.uesr", "Test User", mutableListOf(), mutableMapOf())
        val mockUserService = mock<UserService> {
            on { savePreAuthenticatedUser("test.user", "Test User", "test.user@example.com") } doReturn mockUser
            on { getUserPrincipal(mockUser) } doReturn mockUserPrincipal
        }
        val token = "test-token"
        val mockjwtIssuer = mock<JwtIssuer> {
            on { issue(mockUserPrincipal) } doReturn token
        }

        val sut = PreAuthenticatedLoginService(mockjwtIssuer, mockUserService)
        val result = sut.saveUserAndIssueToken("test.user", "Test User", "test.user@example.com")
        assertEquals(result, mapOf("token" to token))
    }
}