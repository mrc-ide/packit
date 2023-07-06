package packit.service

import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.OutpackMetadata
import packit.model.OutpackResponse
import packit.model.PacketMetadata

interface OutpackServer {
    fun getMetadata(from: Long? = null): List<OutpackMetadata>
    fun <T> get(urlFragment: String): T
    fun getMetadataById(id: String): PacketMetadata?
    fun getFileBy(hash: String): Pair<ByteArray?, HttpHeaders>?
}

@Service
class OutpackServerClient(appConfig: AppConfig) : OutpackServer
{

    private val baseUrl: String = appConfig.outpackServerUrl

    private val restTemplate = RestTemplate()

    override fun getMetadataById(id: String): PacketMetadata
    {
        return getEndpoint("metadata/$id/json")
    }

    override fun getFileBy(hash: String): Pair<ByteArray?, HttpHeaders>
    {
        val url = "$baseUrl/file/$hash"
        log.debug("Fetching {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity.EMPTY,
            ByteArray::class.java
        )
        return handleFileResponse(response)
    }

    private fun handleFileResponse(response: ResponseEntity<ByteArray>): Pair<ByteArray?, HttpHeaders>
    {
        if (response.statusCode.isError)
        {
            throw PackitException("couldNotGetFile", HttpStatus.valueOf(response.statusCode.value()))
        }
        return response.body to response.headers
    }

    private inline fun <reified T> getEndpoint(urlFragment: String): T
    {
        val url = "$baseUrl/$urlFragment"
        log.debug("Fetching {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity.EMPTY,
            object : ParameterizedTypeReference<OutpackResponse<T>>()
            {}
        )

        return handleResponse(response)
    }

    fun getChecksum(): String
    {
        return get("checksum")
    }

    override fun getMetadata(from: Long?): List<OutpackMetadata>
    {
        var url = "$baseUrl/packit/metadata"
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
    override fun <T> get(urlFragment: String): T
    {
        val url = "$baseUrl/$urlFragment"
        log.debug("Fetching {}", url)

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
