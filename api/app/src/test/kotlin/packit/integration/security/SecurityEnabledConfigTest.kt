package packit.integration.security

import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.test.context.TestPropertySource
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Role
import packit.repository.RoleRepository

/**
 * Integration test for security enabled configuration.
 * Uses simple GET /roles endpoint to test authentication and authorization.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
abstract class SecurityEnabledConfigTest : IntegrationTest() {
    @Autowired
    protected lateinit var roleRepository: RoleRepository
    protected val testRole = Role("testRole")

    @BeforeAll
    fun setupRole() {
        roleRepository.save(testRole)
    }

    @AfterAll
    fun cleanupRole() {
        roleRepository.delete(testRole)
    }

    @TestPropertySource(properties = ["auth.enabled=true"])
    @TestInstance(TestInstance.Lifecycle.PER_CLASS)
    class Enabled : SecurityEnabledConfigTest() {
        @Test
        @WithAuthenticatedUser(authorities = [])
        fun `gets unauthorized response when no authority`() {
            val result =
                restTemplate.exchange(
                    "/roles",
                    HttpMethod.GET,
                    getTokenizedHttpEntity(),
                    String::class.java
                )
            assertUnauthorized(result)
        }

        @Test
        @WithAuthenticatedUser(authorities = ["user.manage"])
        fun `gets authorized response when authorized`() {
            val result =
                restTemplate.exchange(
                    "/roles",
                    HttpMethod.GET,
                    getTokenizedHttpEntity(),
                    String::class.java
                )
            assertSuccess(result)
        }
    }

    @TestPropertySource(properties = ["auth.enabled=false"])
    @TestInstance(TestInstance.Lifecycle.PER_CLASS)
    class Disabled : SecurityEnabledConfigTest() {
        @Test
        fun `gets authorized response when no authority`() {
            val result =
                restTemplate.getForEntity("/roles", String::class.java)

            assertSuccess(result)
        }
    }
}
