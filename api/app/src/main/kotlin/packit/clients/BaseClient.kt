package packit.clients

import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.web.client.RestTemplate

abstract class BaseClient(private val baseUrl: String)
{
    private val restTemplate = RestTemplate()

    abstract fun headers(): HttpHeaders

    protected open fun <T> get(path: String): ResponseEntity<T>
    {
        val url = "$baseUrl/$path"
        return restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity<Any>(headers()),
            object : ParameterizedTypeReference<T>()
            {}
        )
    }
}
