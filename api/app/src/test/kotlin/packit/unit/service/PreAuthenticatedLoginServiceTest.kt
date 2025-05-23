package packit.unit.service

import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.argThat
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.User
import packit.security.provider.JwtIssuer
import packit.service.PreAuthenticatedLoginService
import packit.service.UserService
import kotlin.test.Test
import kotlin.test.assertEquals

class PreAuthenticatedLoginServiceTest {
    @Test
    fun `can save user and issue token`() {
        val name = "test.user"
        val displayName = "Test User"
        val mockUser = mock<User> {
            on { username } doReturn name
            on { it.displayName } doReturn displayName
        }
        val mockUserService = mock<UserService> {
            on {
                savePreAuthenticatedUser(
                    name,
                    displayName,
                    "test.user@example.com"
                )
            } doReturn mockUser
        }
        val token = "test-token"
        val mockjwtIssuer = mock<JwtIssuer> {
            on { issue(argThat { this.name == name }) } doReturn token
        }

        val sut = PreAuthenticatedLoginService(mockjwtIssuer, mockUserService)
        val result = sut.saveUserAndIssueToken(name, displayName, "test.user@example.com")
        assertEquals(result, mapOf("token" to token))
    }

    @Test
    fun `saveUserAndIssueToken throws exception if username is empty`() {
        val sut = PreAuthenticatedLoginService(mock(), mock())
        val ex = assertThrows<PackitException> {
            sut.saveUserAndIssueToken("", "Test User", "test.user@example.com")
        }
        assertEquals(ex.httpStatus, HttpStatus.BAD_REQUEST)
        assertEquals(ex.key, "emptyUsername")
    }
}
