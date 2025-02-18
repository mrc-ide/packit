package packit.service

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.commons.io.IOUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.*
import org.springframework.http.client.ClientHttpRequest
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.RestTemplate
import packit.exceptions.PackitException
import packit.model.ServerResponse
import java.io.OutputStream
import java.net.URI

object GenericClient
{

    val log: Logger = LoggerFactory.getLogger(GenericClient::class.java)

    val restTemplate = run {
        val requestFactory = SimpleClientHttpRequestFactory()
        requestFactory.setBufferRequestBody(false)
        RestTemplate(requestFactory)
    }

    inline fun <reified T : Any> get(url: String, uriVariables: Map<String, Any> = emptyMap()): T
    {
        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity.EMPTY,
            object : ParameterizedTypeReference<ServerResponse<T>>() {},
            uriVariables
        )
        return handleResponse(response)
    }

    inline fun <reified T> post(url: String, body: Any? = null, uriVariables: Map<String, Any> = emptyMap()): T
    {
        log.debug("Posting to {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            body?.let { HttpEntity(it) } ?: HttpEntity.EMPTY,
            object : ParameterizedTypeReference<ServerResponse<T>>() {},
            uriVariables
        )

        return handleResponse(response)
    }

    fun proxyRequest(
        url: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
        copyRequestBody: Boolean,
    )
    {
        val method = request.method
        log.debug("{} {}", method, url)
        try
        {
            restTemplate.execute(
                URI(url),
                HttpMethod.valueOf(method),
                { serverRequest: ClientHttpRequest ->
                    request.headerNames.asIterator().forEach {
                        serverRequest.headers.set(it, request.getHeader(it))
                    }
                    if (copyRequestBody) {
                        IOUtils.copy(request.inputStream, serverRequest.body)
                    }
                }
            ) { serverResponse ->
                response.status = serverResponse.statusCode.value()
                serverResponse.headers.map { response.setHeader(it.key, it.value.first()) }
                serverResponse.body.use { inputStream ->
                    IOUtils.copy(inputStream, response.outputStream)
                }
            }
        } catch (e: HttpStatusCodeException)
        {
            throw GenericClientException(e)
        }
    }

    fun streamingGet(url: String, output: OutputStream, copyHeaders: (HttpHeaders) -> Unit) {
        try
        {
            restTemplate.execute(URI(url), HttpMethod.GET, {}) { serverResponse ->
                copyHeaders(serverResponse.headers)
                serverResponse.body.use { input ->
                    IOUtils.copy(input, output)
                }
            }
        } catch (e: HttpStatusCodeException)
        {
            log.error("Error response: {}", e.statusText)
            throw PackitException("couldNotGetFile", HttpStatus.valueOf(e.statusCode.value()))
        }
    }

    fun <T> handleResponse(response: ResponseEntity<ServerResponse<T>>): T
    {
        if (response.statusCode.isError)
        {
            log.error("Error response: {}", response.body?.errors)
            throw PackitException("httpClientError", HttpStatus.INTERNAL_SERVER_ERROR)
        } else
        {
            return response.body!!.data
        }
    }
}

class GenericClientException(e: HttpStatusCodeException) : Exception(e)
