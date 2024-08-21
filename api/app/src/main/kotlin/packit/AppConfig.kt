package packit

import org.springframework.context.annotation.Bean
import org.springframework.core.env.Environment
import org.springframework.core.env.get
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class AppConfig(private val enviroment: Environment)
{

    internal fun requiredEnvValue(key: String): String
    {
        return enviroment[key] ?: throw IllegalArgumentException("$key not set")
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder
    {
        return BCryptPasswordEncoder()
    }

    val outpackServerUrl: String = requiredEnvValue("outpack.server.url")
    val orderlyRunnerUrl: String = requiredEnvValue("orderly.runner.url")
    val dbUrl: String = requiredEnvValue("db.url")
    val dbUser: String = requiredEnvValue("db.user")
    val dbPassword: String = requiredEnvValue("db.password")
    val authJWTSecret: String = requiredEnvValue("auth.jwt.secret")
    val authRedirectUri: String = requiredEnvValue("auth.oauth2.redirect.url")
    val authEnableGithubLogin: Boolean = requiredEnvValue("auth.method") == "github"
    val authEnableBasicLogin: Boolean = requiredEnvValue("auth.method") == "basic"
    val authExpiryDays: Long = requiredEnvValue("auth.expiryDays").toLong()
    val authEnabled: Boolean = requiredEnvValue("auth.enabled").toBoolean()
    val authGithubAPIOrg: String = requiredEnvValue("auth.githubAPIOrg")
    val authGithubAPITeam: String = requiredEnvValue("auth.githubAPITeam")
    val allowedOrigins: List<String> = requiredEnvValue("cors.allowedOrigins").split(",").map { it.trim() }
}
