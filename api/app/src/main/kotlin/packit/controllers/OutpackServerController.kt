package packit.controllers

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.util.AntPathMatcher
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.HandlerMapping
import packit.service.OutpackServerClient

@RestController
@RequestMapping("/outpack")
class OutpackServerController(private val outpackServerClient: OutpackServerClient)
{
    @PreAuthorize("hasAnyAuthority('outpack.read', 'outpack.write')")
    @GetMapping("/**")
    fun get(request: HttpServletRequest, response: HttpServletResponse)
    {
        proxyRequest(request, response, copyRequestBody = false)
    }

    @PostMapping("/**")
    @PreAuthorize("hasAuthority('outpack.write')")
    fun post(request: HttpServletRequest, response: HttpServletResponse)
    {
        proxyRequest(request, response, copyRequestBody = true)
    }

    private fun proxyRequest(
        request: HttpServletRequest,
        response: HttpServletResponse,
        copyRequestBody: Boolean
    )
    {
        val url = getUrlFragment(request)
        outpackServerClient.proxyRequest(url, request, response, copyRequestBody)
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
