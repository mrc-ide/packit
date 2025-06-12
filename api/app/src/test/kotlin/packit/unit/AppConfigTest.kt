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
class AppConfigTest {
    private val requiredEnvVars = mapOf(
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
        "packit.defaultRoles" to "ADMIN,USER",
        "packit.branding.darkModeEnabled" to "true",
        "packit.branding.lightModeEnabled" to "false"
    )
    private val mockEnv = MockEnvironment()

    @BeforeAll
    fun setupEnv() {
        requiredEnvVars.forEach { (key, value) ->
            mockEnv.setProperty(key, value)
        }
    }

    @Test
    fun `passwordEncoder returns instance of BCryptPasswordEncoder`() {
        val sut = AppConfig(mockEnv)

        assert(sut.passwordEncoder() is BCryptPasswordEncoder)
    }

    @Test
    fun `ensure all env variables set in config`() {
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
        assertEquals("basic", sut.authMethod)
        assertEquals(sut.authExpiryDays, 1L)
        assertTrue(sut.authEnabled)
        assertEquals(sut.authGithubAPIOrg, "githubAPIOrg")
        assertEquals(sut.authGithubAPITeam, "githubAPITeam")
        assertEquals(sut.allowedOrigins, listOf("http://localhost", "https://production"))
        assertEquals(sut.defaultRoles, listOf("ADMIN", "USER"))
        assertEquals(sut.brandLogoAltText, null)
        assertEquals(sut.brandLogoFilename, null)
        assertEquals(sut.brandLogoLink, null)
        assertTrue(sut.darkModeEnabled)
        assertFalse(sut.lightModeEnabled)
    }

    @Test
    fun `ensure optional env variables are set in config`() {
        val mockEnvWithOptionalVariables = MockEnvironment()

        requiredEnvVars.forEach { (key, value) ->
            mockEnvWithOptionalVariables.setProperty(key, value)
        }

        mockEnvWithOptionalVariables.setProperty("packit.branding.logoAltText", "This is the logo for our instance")
        mockEnvWithOptionalVariables.setProperty("packit.branding.logoFilename", "newest-logo.png")
        mockEnvWithOptionalVariables.setProperty("packit.branding.logoLink", "https://example.org/example")

        val sut = AppConfig(mockEnvWithOptionalVariables)

        assertEquals(sut.brandLogoAltText, "This is the logo for our instance")
        assertEquals(sut.brandLogoFilename, "newest-logo.png")
        assertEquals(sut.brandLogoLink, "https://example.org/example")
    }

    @Test
    fun `ensure at least one theme is enabled`() {
        val invalidMockEnv = MockEnvironment()

        invalidMockEnv.setProperty("packit.branding.darkModeEnabled", "false")
        invalidMockEnv.setProperty("packit.branding.lightModeEnabled", "false")
        assertThrows<IllegalArgumentException> {
            AppConfig(invalidMockEnv)
        }
    }

    @Test
    fun `requiredEnvValue throws exception if key not set`() {
        val sut = AppConfig(mockEnv)

        assertThrows<IllegalArgumentException> { sut.requiredEnvValue("notSet") }
    }

    @Test
    fun `splitList ignores empty values`() {
        val sut = AppConfig(mockEnv)
        assertTrue(sut.splitList("").isEmpty())
        assertTrue(sut.splitList(" ").isEmpty())
    }

    @Test
    fun `splitList trims whitespace`() {
        val sut = AppConfig(mockEnv)
        assertEquals(sut.splitList("foo, bar"), listOf("foo", "bar"))
        assertEquals(sut.splitList(" foo, bar"), listOf("foo", "bar"))
        assertEquals(sut.splitList(" foo, bar "), listOf("foo", "bar"))
        assertEquals(sut.splitList(" foo , bar "), listOf("foo", "bar"))
    }
}
