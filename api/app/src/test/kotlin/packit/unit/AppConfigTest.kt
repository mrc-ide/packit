package packit.unit

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.springframework.mock.env.MockEnvironment
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import packit.AppConfig
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AppConfigTest
{
    private val environmentVariables = mapOf(
        "outpack.server.url" to "url",
        "orderly.runner.url" to "url",
        "db.url" to "url",
        "db.user" to "user",
        "db.password" to "password",
        "auth.jwt.secret" to "secret",
        "auth.oauth2.redirect.url" to "redirectUrl",
        "auth.method" to "basic",
        "auth.expiryDays" to "1",
        "auth.enabled" to "true",
        "auth.githubAPIOrg" to "githubAPIOrg",
        "auth.githubAPITeam" to "githubAPITeam",
        "cors.allowedOrigins" to "http://localhost, https://production",
        "packit.defaultRoles" to "ADMIN,USER"
    )
    private val mockEnv = MockEnvironment()

    @BeforeAll
    fun setupEnv()
    {
        environmentVariables.forEach { (key, value) ->
            mockEnv.setProperty(key, value)
        }
    }

    @Test
    fun `passwordEncoder returns instance of BCryptPasswordEncoder`()
    {
        val sut = AppConfig(mockEnv)

        assert(sut.passwordEncoder() is BCryptPasswordEncoder)
    }

    @Test
    fun `ensure all env variables set in config`()
    {
        val sut = AppConfig(mockEnv)

        assertEquals(sut.outpackServerUrl, "url")
        assertEquals(sut.dbUrl, "url")
        assertEquals(sut.dbUser, "user")
        assertEquals(sut.dbPassword, "password")
        assertEquals(sut.authJWTSecret, "secret")
        assertEquals(sut.authRedirectUri, "redirectUrl")
        assertFalse(sut.authEnableGithubLogin)
        assertFalse(sut.authEnablePreAuthLogin)
        assertTrue(sut.authEnableBasicLogin)
        assertEquals(sut.authExpiryDays, 1L)
        assertTrue(sut.authEnabled)
        assertEquals(sut.authGithubAPIOrg, "githubAPIOrg")
        assertEquals(sut.authGithubAPITeam, "githubAPITeam")
        assertEquals(sut.allowedOrigins, listOf("http://localhost", "https://production"))
        assertEquals(sut.defaultRoles, listOf("ADMIN", "USER"))
    }

    @Test
    fun `requiredEnvValue throws exception if key not set`()
    {
        val sut = AppConfig(mockEnv)

        assertThrows<IllegalArgumentException> { sut.requiredEnvValue("notSet") }
    }

    @Test
    fun `splitList ignores empty values`()
    {
        val sut = AppConfig(mockEnv)
        assertTrue(sut.splitList("").isEmpty())
        assertTrue(sut.splitList(" ").isEmpty())
    }

    @Test
    fun `splitList trims whitespace`()
    {
        val sut = AppConfig(mockEnv)
        assertEquals(sut.splitList("foo, bar"), listOf("foo", "bar"))
        assertEquals(sut.splitList(" foo, bar"), listOf("foo", "bar"))
        assertEquals(sut.splitList(" foo, bar "), listOf("foo", "bar"))
        assertEquals(sut.splitList(" foo , bar "), listOf("foo", "bar"))
    }
}
