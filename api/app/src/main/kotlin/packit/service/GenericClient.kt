package packit.service

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.tomcat.util.http.fileupload.IOUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.*
import org.springframework.http.client.ClientHttpRequest
import org.springframework.http.client.ClientHttpResponse
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.util.StreamUtils
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.ResponseExtractor
import org.springframework.web.client.RestTemplate
import packit.exceptions.PackitException
import packit.model.ServerResponse
import java.io.OutputStream
import java.net.URI
import org.springframework.web.reactive.function.client.WebClient
import java.io.InputStream

object GenericClient
{

    val log: Logger = LoggerFactory.getLogger(GenericClient::class.java)

    val restTemplate = run {
        val requestFactory = SimpleClientHttpRequestFactory()
        requestFactory.setBufferRequestBody(false)
        RestTemplate(requestFactory)
    }

    inline fun <reified T : Any> get(url: String): T
    {
        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity.EMPTY,
            object : ParameterizedTypeReference<ServerResponse<T>>()
            {}
        )
        return handleResponse(response)
    }

    inline fun <reified T> post(url: String, body: Any? = null): T
    {
        log.debug("Posting to {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            body?.let { HttpEntity(it) } ?: HttpEntity.EMPTY,
            object : ParameterizedTypeReference<ServerResponse<T>>()
            {}
        )

        return handleResponse(response)
    }

    // TODO: Refactor extractResponse back into proxyRequest, and write a separate streamFile.
    fun <T> extractResponse(
        url: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
        copyRequestBody: Boolean,
        responseExtractor: (ClientHttpResponse) -> T
    ): T
    {
        log.debug("{} {}", request.method, url)
        try
        {
            return restTemplate.execute(
                URI(url),
                HttpMethod.valueOf(request.method),
                { serverRequest: ClientHttpRequest ->
                    request.headerNames.asIterator().forEach {
                        serverRequest.headers.set(it, request.getHeader(it))
                    }
                    if (copyRequestBody) {
                        IOUtils.copy(request.inputStream, serverRequest.body)
                    }
                }
            ) { serverResponse ->
                if (serverResponse.statusCode.is5xxServerError) {
                    throw HttpServerErrorException(serverResponse.statusCode)
                } else if (serverResponse.statusCode.is4xxClientError) {
                    throw HttpClientErrorException(serverResponse.statusCode)
                }
                responseExtractor(serverResponse)
            } ?: throw PackitException("Empty response body", HttpStatus.INTERNAL_SERVER_ERROR)
        } catch (e: HttpStatusCodeException)
        {
            throw GenericClientException(e)
        }
    }

    fun proxyRequest2(
        url: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
        copyRequestBody: Boolean
    )
    {
        extractResponse(url, request, response, copyRequestBody) { serverResponse ->
            response.status = serverResponse.statusCode.value()
            serverResponse.headers.map { response.setHeader(it.key, it.value.first()) }
            // copy "all the data from one stream to another": (inputstream, outputstream)
            IOUtils.copy(serverResponse.body, response.outputStream)
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

    fun getFile(url: String): Pair<ByteArray, HttpHeaders>
    {
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

//    fun streamFile(url: String, outputStream: OutputStream) {
//        log.debug("Streaming {}", url)
//
//        try {
//            restTemplate.execute(
//                url,
//                HttpMethod.GET,
//                null,
//                { clientHttpResponse ->
//                    IOUtils.copy(clientHttpResponse.body, outputStream)
//                    true
//                }
//            )
//        } catch (e: HttpStatusCodeException) {
//            throw GenericClientException(e)
//        }
//
//        // TODO: Remember about closing streams.
//        // TODO: Could the below be preferable to IOUtils.copy?
////        StreamUtils.copy(inputStream, outputStream) - as used by https://stackoverflow.com/a/56569356
//
//        // TODO: can we use this little library? https://github.com/ItamarBenjamin/stream-rest-template linked from above stackoverflow thread
//
//        // TODO: consider resttemplate's author said not to use it for streaming, but use 'WebClient' instead:
//        // https://github.com/spring-projects/spring-framework/issues/21424#issuecomment-453472592
//
//    }

}

class GenericClientException(e: HttpStatusCodeException) : Exception(e)
