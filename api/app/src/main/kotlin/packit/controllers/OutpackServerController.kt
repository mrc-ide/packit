package packit.controllers

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.util.AntPathMatcher
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.HandlerMapping
import packit.service.OutpackServerClient

@RestController
@RequestMapping("/outpack")
class OutpackServerController(private val outpackServerClient: OutpackServerClient)
{

    @RequestMapping("/**", method = [RequestMethod.GET, RequestMethod.POST])
    fun post(request: HttpServletRequest, response: HttpServletResponse)
    {
        val url = getUrlFragment(request)
        outpackServerClient.proxyRequest(url, request, response)
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
