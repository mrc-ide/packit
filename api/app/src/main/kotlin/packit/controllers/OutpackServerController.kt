package packit.controllers

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.util.AntPathMatcher
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.servlet.HandlerMapping
import packit.service.OutpackServerClient

@RestController
@RequestMapping("/outpack")
class OutpackServerController(private val outpackServerClient: OutpackServerClient)
{
    @GetMapping("/**")
    fun get(request: HttpServletRequest): ResponseEntity<String>
    {
        val apm = AntPathMatcher()
        val finalPath = apm.extractPathWithinPattern(
                request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE) as String,
                request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE) as String
        )
        try
        {
            return outpackServerClient.getRaw(finalPath)
        }
        catch (e: HttpClientErrorException)
        {
            throw OutpackServerException(e)
        }
    }
}

class OutpackServerException(e: HttpClientErrorException) : Exception(e)
