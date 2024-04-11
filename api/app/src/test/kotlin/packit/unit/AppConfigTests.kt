package packit.unit

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import packit.AppConfig
import packit.PackitProperties
import java.io.File

class AppConfigTests
{
    @AfterEach
    fun cleanup()
    {
        File("tmp").deleteRecursively()
    }

    @Test
    fun `properties can be read from disk`()
    {
        File("tmp").mkdir()
        val config = File("tmp/fake.properties")
        config.createNewFile()
        config.writeText("something=1234")
        val props = AppConfig.readProperties("tmp/fake.properties")
        assertEquals(props["something"], "1234")
    }

    @Test
    fun `properties are expected at the correct path`()
    {
        assertEquals(AppConfig.configPath, "/etc/packit/config.properties")
    }

    @Test
    fun `derives config from properties`()
    {
        val authSecret = "secret"
        val expiryDays = 1L
        val enableAuth = true
        val redirectUrl = "http://redirect"
        val authMethod = "github"

        val props = PackitProperties()

        props["db.url"] = "url"
        props["db.user"] = "user"
        props["db.password"] = "pw"
        props["auth.enabled"] = enableAuth
        props["auth.expiryDays"] = expiryDays
        props["auth.jwt.secret"] = authSecret
        props["outpack.server.url"] = "outpackServerUrl"
        props["auth.method"] = authMethod
        props["auth.oauth2.redirect.url"] = redirectUrl

        val sut = AppConfig(props)

        assertEquals(sut.dbUrl, "url")
        assertEquals(sut.dbUser, "user")
        assertEquals(sut.dbPassword, "pw")
        assertEquals(sut.authEnabled, enableAuth)
        assertEquals(sut.authExpiryDays, expiryDays)
        assertEquals(sut.authJWTSecret, authSecret)
        assertEquals(sut.authRedirectUri, redirectUrl)
        assertEquals(sut.outpackServerUrl, "outpackServerUrl")
        assertEquals(sut.authEnableGithubLogin, true)
        assertEquals(sut.authEnableBasicLogin, false)
    }
}
