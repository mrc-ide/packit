package packit.unit.service

import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import packit.exceptions.PackitException
import packit.model.User
import packit.model.dto.LoginWithPassword
import packit.security.profile.BasicUserDetails
import packit.security.provider.JwtIssuer
import packit.service.BasicLoginService
import packit.service.UserService
import kotlin.test.Test
import kotlin.test.assertEquals

class BasicLoginServiceTest {
    private val user = User(
        username = "userName",
        displayName = "displayName",
        password = "password",
        disabled = false,
        userSource = "basic"
    )
    private val mockIssuer = mock<JwtIssuer> {
        on { issue(argThat { this == user }) } doReturn "fake jwt"
    }
    private val mockAuthentication = mock<Authentication> {
        on { principal } doReturn BasicUserDetails(user)
    }
    private val mockAuthenticationManager = mock<AuthenticationManager> {
        on { authenticate(any<UsernamePasswordAuthenticationToken>()) } doReturn mockAuthentication
    }
    private val mockUserService = mock<UserService>()

    @Test
    fun `can authenticate and issue token`() {
        val loginWithPassword = LoginWithPassword("fake email", "fake password")
        val sut = BasicLoginService(mockIssuer, mockAuthenticationManager, mockUserService)

        val token = sut.authenticateAndIssueToken(loginWithPassword)

        verify(mockAuthenticationManager).authenticate(
            UsernamePasswordAuthenticationToken(
                loginWithPassword.email,
                loginWithPassword.password
            )
        )
        assertEquals(mapOf("token" to "fake jwt"), token)
        verify(mockUserService).checkAndUpdateLastLoggedIn(loginWithPassword.email)
    }

    @Test
    fun `throws if email and password are empty`() {
        val sut = BasicLoginService(mockIssuer, mockAuthenticationManager, mockUserService)

        val ex = assertThrows<PackitException> { sut.authenticateAndIssueToken(LoginWithPassword("", "")) }
        assertEquals("emptyCredentials", ex.key)
        assertEquals(HttpStatus.BAD_REQUEST, ex.httpStatus)
    }
}
