package packit.service

import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import packit.AppConfig
import packit.model.OutpackMetadata
import packit.model.OutpackResponse

@Service
class OutpackServerClient(appConfig: AppConfig)
{

    private val baseUrl: String = appConfig.outpackServerUrl

    private val restTemplate = RestTemplate()

    fun getChecksum(): String
    {
        return get("checksum")
    }

    fun getMetadata(from: Long? = null): List<OutpackMetadata>
    {
        var url = "$baseUrl/metadata"
        if (from != null)
        {
            url = "$url?known_since=$from"
        }
        val response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                object : ParameterizedTypeReference<OutpackResponse<List<OutpackMetadata>>>()
                {}
        )

        return handleResponse(response)
    }

    // This will work where T is a base type but not for package defined types
    private fun <T> get(urlFragment: String): T
    {
        val url = "$baseUrl/$urlFragment"
        log.info("Fetching {}", url)

        val response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                object : ParameterizedTypeReference<OutpackResponse<T>>()
                {}
        )

        return handleResponse(response)
    }

    private fun <T> handleResponse(response: ResponseEntity<OutpackResponse<T>>): T
    {
        if (response.statusCode.isError)
        {
            // TODO we need proper error handling for the whole app
            // this is really just a placeholder
            @Suppress("TooGenericExceptionThrown")
            throw Exception(response.body?.errors.toString())
        }
        else
        {
            return response.body!!.data
        }
    }

    companion object
    {
        private val log = LoggerFactory.getLogger(OutpackServerClient::class.java)
    }
}
