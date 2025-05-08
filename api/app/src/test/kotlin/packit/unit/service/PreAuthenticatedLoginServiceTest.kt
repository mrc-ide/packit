package packit.unit.service

import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.User
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.PreAuthenticatedLoginService
import packit.service.UserService
import kotlin.test.Test
import kotlin.test.assertEquals

class PreAuthenticatedLoginServiceTest
{
    @Test
    fun `can save user and issue token`()
    {
        val mockUser = mock<User>()
        val mockUserPrincipal = mock<UserPrincipal>()
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

    @Test
    fun `saveUserAndIssueToken throws exception if username is empty`()
    {
        val sut = PreAuthenticatedLoginService(mock(), mock())
        val ex = assertThrows<PackitException> {
            sut.saveUserAndIssueToken("", "Test User", "test.user@example.com")
        }
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
        assertEquals(ex.key, "emptyUsername")
    }
}
