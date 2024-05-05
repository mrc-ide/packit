package packit.integration

import org.springframework.security.test.context.support.WithSecurityContext

@Retention(AnnotationRetention.RUNTIME)
@WithSecurityContext(factory = WithMockAuthenticatedSecurityFactory::class)
annotation class WithAuthenticatedUser(
    val authorities: Array<String> = ["ADMIN"]
)
