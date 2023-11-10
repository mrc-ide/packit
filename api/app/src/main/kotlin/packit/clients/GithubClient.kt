package packit.clients

import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import packit.AppConfig

@Component
class GithubClient(
    private val appConfig: AppConfig
) : Client, BaseClient(appConfig.authGithubAPIBaseUrl)
{
    private var personalAccessToken: String = ""

    fun build(token: String): GithubClient {
        val clonedClient = GithubClient(appConfig)
        clonedClient.personalAccessToken = token
        return clonedClient
    }

    override fun headers(): HttpHeaders
    {
        val headers = HttpHeaders()
        headers.setBearerAuth(personalAccessToken)
        return headers
    }

    override fun <T> get(path: String): ResponseEntity<T> = super.get(path)
}
