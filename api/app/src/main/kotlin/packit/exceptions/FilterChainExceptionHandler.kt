package packit.exceptions

import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.servlet.HandlerExceptionResolver
import java.io.IOException

@Component
class FilterChainExceptionHandler(
    private val handlerExceptionResolver: HandlerExceptionResolver
) : OncePerRequestFilter()
{
    companion object
    {
        private val log = LoggerFactory.getLogger(FilterChainExceptionHandler::class.java)
    }

    @Throws(ServletException::class, IOException::class)
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain)
    {
        try
        {
            filterChain.doFilter(request, response)
        } catch (e: Exception)
        {
            log.error("Spring Security Filter Chain Exception:", e)
            handlerExceptionResolver.resolveException(request, response, null, e)
        }
    }
}
