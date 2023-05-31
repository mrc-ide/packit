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
        val props = PackitProperties()
        props["outpack.server.url"] = "outpackServerUrl"
        props["db.url"] = "url"
        props["db.user"] = "user"
        props["db.password"] = "pw"
        val sut = AppConfig(props)
        assertEquals(sut.outpackServerUrl, "outpackServerUrl")
        assertEquals(sut.dbUrl, "url")
        assertEquals(sut.dbUser, "user")
        assertEquals(sut.dbPassword, "pw")
    }
}
