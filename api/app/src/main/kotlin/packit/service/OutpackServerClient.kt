package packit.service

import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.core.io.InputStreamResource
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import packit.AppConfig
import packit.model.OutpackMetadata
import packit.model.OutpackResponse
import packit.model.PacketMetadata
import java.io.ByteArrayInputStream

interface OutpackServer {
    fun getMetadata(from: Long? = null): List<OutpackMetadata>
    fun <T> get(urlFragment: String): T
    fun getMetadataById(id: String): PacketMetadata
    fun getFileBy(hash: String): InputStreamResource
}

@Service
class OutpackServerClient(appConfig: AppConfig): OutpackServer
{

    private val baseUrl: String = appConfig.outpackServerUrl

    private val restTemplate = RestTemplate()

    override fun getMetadataById(id: String): PacketMetadata
    {
        return getEndpoint("metadata/$id/json")
    }

    override fun getFileBy(hash: String): InputStreamResource
    {
        val url = "$baseUrl/file/$hash"
        log.debug("Fetching {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity.EMPTY,
            ByteArray::class.java
        )

        return handleByteArrayResponse(response)
    }

    private fun handleByteArrayResponse(response: ResponseEntity<ByteArray>): InputStreamResource
    {
        if (response.statusCode == HttpStatus.OK)
        {
            val inputStream = ByteArrayInputStream(response.body)

            return InputStreamResource(inputStream)

        } else
        {
            throw RuntimeException("Error occurred: ${response.statusCode}")
        }
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
