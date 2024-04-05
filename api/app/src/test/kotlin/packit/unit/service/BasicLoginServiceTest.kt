package packit.unit.service

import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import packit.exceptions.PackitException
import packit.model.LoginWithPassword
import packit.security.profile.BasicUserDetails
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import packit.service.BasicLoginService
import kotlin.test.Test
import kotlin.test.assertEquals

class BasicLoginServiceTest
{
    private val userPrincipal = UserPrincipal(
        "userName",
        "displayName",
        mutableListOf(),
        mutableMapOf()
    )
    private val mockIssuer = mock<JwtIssuer> {
        on { issue(argThat { this == userPrincipal }) } doReturn "fake jwt"
    }
    private val mockAuthentication = mock<Authentication> {
        on { principal } doReturn BasicUserDetails(userPrincipal, "password")
    }
    private val mockAuthenticationManager = mock<AuthenticationManager> {
        on { authenticate(any<UsernamePasswordAuthenticationToken>()) } doReturn mockAuthentication
    }

    @Test
    fun `can authenticate and issue token`()
    {
        val sut = BasicLoginService(mockIssuer, mockAuthenticationManager)

        val token = sut.authenticateAndIssueToken(LoginWithPassword("fake email", "fake password"))

        verify(mockAuthenticationManager).authenticate(
            UsernamePasswordAuthenticationToken(
                "fake email",
                "fake password"
            )
        )
        assertEquals(mapOf("token" to "fake jwt"), token)
    }

    @Test
    fun `throws if email and password are empty`()
    {
        val sut = BasicLoginService(mockIssuer, mockAuthenticationManager)

        val ex = assertThrows<PackitException> { sut.authenticateAndIssueToken(LoginWithPassword("", "")) }
        assertEquals("Empty user details", ex.key)
        assertEquals(HttpStatus.BAD_REQUEST, ex.httpStatus)
    }
}
