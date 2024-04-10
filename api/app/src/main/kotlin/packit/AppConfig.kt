package packit

import org.springframework.context.annotation.Bean
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.io.File
import java.io.FileNotFoundException
import java.net.URL
import java.util.*

// prevent auto-wiring of default Properties
class PackitProperties : Properties()

@Component
class AppConfig(private val props: PackitProperties = properties)
{
    val outpackServerUrl: String = propString("outpack.server.url")
    val dbUrl: String = propString("db.url")
    val dbUser: String = propString("db.user")
    val dbPassword: String = propString("db.password")
    val authJWTSecret: String = propString("auth.jwt.secret")
    val authRedirectUri: String = propString("auth.oauth2.redirect.url")
    val authEnableGithubLogin: Boolean = propString("auth.method") == "github"
    val authEnableBasicLogin: Boolean = propString("auth.method") == "basic"
    val authExpiryDays: Long = propString("auth.expiryDays").toLong()
    val authEnabled: Boolean = propString("auth.enabled").toBoolean()
    val authGithubAPIOrg: String = propString("auth.githubAPIOrg")
    val authGithubAPITeam: String = propString("auth.githubAPITeam")

    private fun propString(propName: String): String
    {
        return props[propName].toString()
    }


    companion object
    {

        fun readProperties(configPath: String): PackitProperties
        {
            return PackitProperties().apply {
                load(getResource("config.properties").openStream())
                val global = File(configPath)
                if (global.exists())
                {
                    global.inputStream().use { load(it) }
                }
            }
        }

        var configPath = "/etc/packit/config.properties"
        val properties = readProperties(configPath)
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder
    {
        return BCryptPasswordEncoder()
    }
}

fun getResource(path: String): URL
{
    val url: URL? = AppConfig::class.java.classLoader.getResource(path)
    if (url != null)
    {
        return url
    } else
    {
        throw FileNotFoundException("Unable to load '$path' as a resource steam")
    }
}
