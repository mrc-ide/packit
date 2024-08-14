package packit.service

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.tomcat.util.http.fileupload.IOUtils
import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.*
import org.springframework.http.client.ClientHttpRequest
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.RestTemplate
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.PacketMetadata
import packit.model.ServerResponse
import packit.model.dto.OutpackMetadata
import java.net.URI

interface OutpackServer
{
    fun getMetadata(from: Double? = null): List<OutpackMetadata>
    fun getMetadataById(id: String): PacketMetadata?
    fun getFileByHash(hash: String): Pair<ByteArray, HttpHeaders>?
    fun proxyRequest(urlFragment: String, request: HttpServletRequest, response: HttpServletResponse)
    fun getChecksum(): String
    fun gitFetch()
}

@Service
class OutpackServerClient(appConfig: AppConfig) : OutpackServer
{
    val baseUrl: String = appConfig.outpackServerUrl

    private val restTemplate = RestTemplate()

    override fun proxyRequest(urlFragment: String, request: HttpServletRequest, response: HttpServletResponse)
    {
        val url = "$baseUrl/$urlFragment"
        val method = request.method
        log.debug("{} {}", method, url)
        try
        {
            restTemplate.execute(
                URI(url),
                HttpMethod.valueOf(method),
                { outpackServerRequest: ClientHttpRequest ->
                    request.headerNames.asIterator().forEach {
                        outpackServerRequest.headers.set(it, request.getHeader(it))
                    }
                    IOUtils.copy(request.inputStream, outpackServerRequest.body)
                }
            ) { outpackServerResponse ->
                response.status = response.status
                outpackServerResponse.headers.map { response.setHeader(it.key, it.value.first()) }
                IOUtils.copy(outpackServerResponse.body, response.outputStream)
                true
            }
        } catch (e: HttpStatusCodeException)
        {
            throw OutpackServerException(e)
        }
    }

    override fun getMetadataById(id: String): PacketMetadata
    {
        return getEndpoint("metadata/$id/json")
    }

    override fun getFileByHash(hash: String): Pair<ByteArray, HttpHeaders>
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

    private fun handleFileResponse(response: ResponseEntity<ByteArray>): Pair<ByteArray, HttpHeaders>
    {
        if (response.statusCode.isError)
        {
            throw PackitException("couldNotGetFile", HttpStatus.valueOf(response.statusCode.value()))
        }
        return response.body!! to response.headers
    }

    override fun getChecksum(): String
    {
        return getEndpoint("checksum")
    }

    override fun gitFetch()
    {
        var urlFragment = "git/fetch"
        return postEndpoint(urlFragment)
    }

    override fun getMetadata(from: Double?): List<OutpackMetadata>
    {
        var url = "packit/metadata"
        if (from != null)
        {
            url = "$url?known_since=$from"
        }
        return getEndpoint(url)
    }

    private inline fun <reified T> postEndpoint(urlFragment: String, body: Any? = null): T
    {
        val url = "$baseUrl/$urlFragment"
        log.debug("Posting to {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            null,
            object : ParameterizedTypeReference<ServerResponse<T>>()
            {}
        )

        return handleResponse(response)
    }

    private inline fun <reified T> getEndpoint(urlFragment: String): T
    {
        val url = "$baseUrl/$urlFragment"
        log.debug("Fetching {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity.EMPTY,
            object : ParameterizedTypeReference<ServerResponse<T>>()
            {}
        )

        return handleResponse(response)
    }

    private fun <T> handleResponse(response: ResponseEntity<ServerResponse<T>>): T
    {
        if (response.statusCode.isError)
        {
            // TODO we need proper error handling for the whole app
            // this is really just a placeholder
            @Suppress("TooGenericExceptionThrown")
            throw PackitException(response.body?.errors.toString())
        } else
        {
            return response.body!!.data
        }
    }

    companion object
    {
        private val log = LoggerFactory.getLogger(OutpackServerClient::class.java)
    }
}

class OutpackServerException(e: HttpStatusCodeException) : Exception(e)
