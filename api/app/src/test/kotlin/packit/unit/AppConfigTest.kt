package packit.unit

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.springframework.mock.env.MockEnvironment
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import packit.AppConfig
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AppConfigTest
{
    private val environmentVariables = mapOf(
        "outpack.server.url" to "url",
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
        "cors.allowedOrigins" to "http://localhost, https://production"
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

        assert(sut.outpackServerUrl == "url")
        assert(sut.dbUrl == "url")
        assert(sut.dbUser == "user")
        assert(sut.dbPassword == "password")
        assert(sut.authJWTSecret == "secret")
        assert(sut.authRedirectUri == "redirectUrl")
        assertFalse(sut.authEnableGithubLogin)
        assertTrue(sut.authEnableBasicLogin)
        assert(sut.authExpiryDays == 1L)
        assert(sut.authEnabled)
        assert(sut.authGithubAPIOrg == "githubAPIOrg")
        assert(sut.authGithubAPITeam == "githubAPITeam")
        assert(sut.allowedOrigins == listOf("http://localhost", "https://production"))
    }

    @Test
    fun `requiredEnvValue throws exception if key not set`()
    {
        val sut = AppConfig(mockEnv)

        assertThrows<IllegalArgumentException> { sut.requiredEnvValue("notSet") }
    }
}
