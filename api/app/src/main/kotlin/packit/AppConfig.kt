package packit

import org.springframework.context.annotation.Bean
import org.springframework.core.env.Environment
import org.springframework.core.env.get
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class AppConfig(private val environment: Environment) {
    internal final fun requiredEnvValue(key: String): String {
        return environment[key] ?: throw IllegalArgumentException("$key not set $environment")
    }

    internal final fun optionalEnvValue(key: String): String? {
        return environment[key]
    }

    internal final fun splitList(value: String): List<String> {
        return if (value.isBlank()) {
            listOf()
        } else {
            value.split(",").map { it.trim() }
        }
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    val outpackServerUrl: String = requiredEnvValue("outpack.server.url")
    val dbUrl: String = requiredEnvValue("db.url")
    val dbUser: String = requiredEnvValue("db.user")
    val dbPassword: String = requiredEnvValue("db.password")
    val authJWTSecret: String = requiredEnvValue("auth.jwt.secret")
    val authRedirectUri: String = requiredEnvValue("auth.oauth2.redirect.url")
    val authMethod: String = requiredEnvValue("auth.method")
    val authEnableGithubLogin: Boolean = requiredEnvValue("auth.method") == "github"
    val authEnableBasicLogin: Boolean = requiredEnvValue("auth.method") == "basic"
    val authEnablePreAuthLogin: Boolean = requiredEnvValue("auth.method") == "preauth"
    val authExpiryDays: Long = requiredEnvValue("auth.expiryDays").toLong()
    val authEnabled: Boolean = requiredEnvValue("auth.enabled").toBoolean()
    val authGithubAPIOrg: String = requiredEnvValue("auth.githubAPIOrg")
    val authGithubAPITeam: String = requiredEnvValue("auth.githubAPITeam")
    val allowedOrigins: List<String> = splitList(requiredEnvValue("cors.allowedOrigins"))
    val defaultRoles: List<String> = splitList(requiredEnvValue("packit.defaultRoles"))
    val brandLogoAltText: String? = optionalEnvValue("packit.branding.logoAltText")
    val brandLogoFilename: String? = optionalEnvValue("packit.branding.logoFilename")
    val brandLogoLink: String? = optionalEnvValue("packit.branding.logoLink")
    val darkModeEnabled: Boolean = requiredEnvValue("packit.branding.darkModeEnabled").toBoolean()
    val lightModeEnabled: Boolean = requiredEnvValue("packit.branding.lightModeEnabled").toBoolean()

    init {
        require(darkModeEnabled || lightModeEnabled) {
            "At least one theme must be enabled."
        }
    }
}
