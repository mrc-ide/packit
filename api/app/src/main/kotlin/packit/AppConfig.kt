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

    val outpackServerUrl: String =
        enviroment["outpack.server.url"] ?: throw IllegalArgumentException("outpack.server.url not set")
    val dbUrl: String = enviroment["db.url"] ?: throw IllegalArgumentException("db.url not set")
    val dbUser: String = enviroment["db.user"] ?: throw IllegalArgumentException("db.user not set")
    val dbPassword: String = enviroment["db.password"] ?: throw IllegalArgumentException("db.password not set")
    val authJWTSecret: String =
        enviroment["auth.jwt.secret"] ?: throw IllegalArgumentException("auth.jwt.secret not set")
    val authRedirectUri: String =
        enviroment["auth.oauth2.redirect.url"] ?: throw IllegalArgumentException("auth.oauth2.redirect.url not set")
    val authEnableGithubLogin: Boolean = enviroment["auth.method"] == "github"
    val authEnableBasicLogin: Boolean = enviroment["auth.method"] == "basic"
    val authExpiryDays: Long =
        enviroment["auth.expiryDays"]?.toLong() ?: throw IllegalArgumentException("auth.expiryDays not set")
    val authEnabled: Boolean =
        enviroment["auth.enabled"]?.toBoolean() ?: throw IllegalArgumentException("auth.enabled not set")
    val authGithubAPIOrg: String =
        enviroment["auth.githubAPIOrg"] ?: throw IllegalArgumentException("auth.githubAPIOrg not set")
    val authGithubAPITeam: String =
        enviroment["auth.githubAPITeam"] ?: throw IllegalArgumentException("auth.githubAPITeam not set")

    @Bean
    fun passwordEncoder(): PasswordEncoder
    {
        return BCryptPasswordEncoder()
    }
}
