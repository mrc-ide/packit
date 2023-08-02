package packit.controllers

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.tomcat.util.http.fileupload.IOUtils
import org.springframework.http.HttpMethod
import org.springframework.http.client.ClientHttpRequest
import org.springframework.util.AntPathMatcher
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.RestTemplate
import org.springframework.web.servlet.HandlerMapping
import packit.service.OutpackServerClient
import java.net.URI

@RestController
@RequestMapping("/outpack")
class OutpackServerController(private val outpackServerClient: OutpackServerClient)
{

    @RequestMapping("/**", method = [RequestMethod.GET, RequestMethod.POST])
    fun post(request: HttpServletRequest, response: HttpServletResponse)
    {
        val url = getUrlFragment(request)
        val restTemplate = RestTemplate()

        try
        {
            restTemplate.execute(
                    URI("${outpackServerClient.baseUrl}/$url"),
                    HttpMethod.valueOf(request.method),
                    { requestCallback: ClientHttpRequest ->
                        IOUtils.copy(request.inputStream, requestCallback.body)
                    }
            ) { responseExtractor ->
                response.status = response.status
                responseExtractor.headers.map { response.setHeader(it.key, it.value.first()) }
                IOUtils.copy(responseExtractor.body, response.outputStream)
                true
            }
        }
        catch (e: HttpStatusCodeException)
        {
            throw OutpackServerException(e)
        }
    }

    private fun getUrlFragment(request: HttpServletRequest): String
    {
        val apm = AntPathMatcher()
        return apm.extractPathWithinPattern(
                request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE) as String,
                request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE) as String
        )
    }
}

class OutpackServerException(e: HttpStatusCodeException) : Exception(e)
