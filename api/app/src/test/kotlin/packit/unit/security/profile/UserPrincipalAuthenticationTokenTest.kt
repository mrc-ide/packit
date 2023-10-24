package packit.unit.security.profile

import org.junit.jupiter.api.Test
import packit.security.profile.UserPrincipal
import packit.security.profile.UserPrincipalAuthenticationToken
import kotlin.test.assertEquals

class UserPrincipalAuthenticationTokenTest
{
    @Test
    fun `can get authenticated profile`()
    {
        val name = "fakeName"
        val email = "test@email.com"

        val userPrincipal = UserPrincipal(
            email,
            "",
            mutableListOf(),
            name,
            mutableMapOf()
        )

        val result = UserPrincipalAuthenticationToken(userPrincipal)

        assertEquals(result.isAuthenticated, true)
        assertEquals(result.credentials, "")
        assertEquals(result.principal, userPrincipal)
    }
}
