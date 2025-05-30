package packit.unit.security.profile

import org.junit.jupiter.api.Test
import packit.security.profile.UserPrincipal
import packit.security.profile.UserPrincipalAuthenticationToken
import kotlin.test.assertEquals

class UserPrincipalAuthenticationTokenTest {
    @Test
    fun `can get authenticated profile`() {
        val userName = "fakeName"
        val displayName = "Fake Name"

        val userPrincipal = UserPrincipal(
            userName,
            displayName,
            mutableListOf(),
        )

        val result = UserPrincipalAuthenticationToken(userPrincipal)

        assertEquals(result.isAuthenticated, true)
        assertEquals(result.credentials, "")
        assertEquals(result.principal, userPrincipal)
    }
}
