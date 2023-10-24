package packit.integration

import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.test.context.support.WithSecurityContextFactory
import packit.security.profile.UserPrincipal
import packit.security.profile.UserPrincipalAuthenticationToken

class WithMockAuthenticatedSecurityFactory : WithSecurityContextFactory<WithAuthenticatedUser>
{

    override fun createSecurityContext(annotation: WithAuthenticatedUser): SecurityContext
    {
        val principal = UserPrincipal(
            "test.user@example.com",
            "password",
            mutableListOf(),
            "",
            mutableMapOf()
        )

        val context = SecurityContextHolder.createEmptyContext()

        context.authentication = UserPrincipalAuthenticationToken(principal)

        return context
    }
}
