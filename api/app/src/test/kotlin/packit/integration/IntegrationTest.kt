package packit.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.core.env.Environment
import org.springframework.http.*
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.security.core.context.SecurityContextHolder
import packit.security.profile.UserPrincipal
import packit.security.provider.JwtIssuer
import kotlin.test.assertEquals

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)

abstract class IntegrationTest
{
    @BeforeEach
    fun setup()
    {
        // Default test rest template settings throw when examine
        // status of 401 responses, using alternative factory fixes this
        // https://stackoverflow.com/questions/16748969
        val factory = SimpleClientHttpRequestFactory()
        factory.setOutputStreaming(false)
        restTemplate.restTemplate.requestFactory = factory
    }

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    @Autowired
    private lateinit var jwtIssuer: JwtIssuer

    @Autowired
    lateinit var env: Environment

    val jsonValidator = JSONValidator()

    protected fun getTokenizedHttpEntity(
        contentType: MediaType = MediaType.APPLICATION_JSON,
        data: Any? = null,
    ): HttpEntity<Any>
    {
        val authentication = SecurityContextHolder.getContext().authentication

        val tokens = jwtIssuer.issue(authentication.principal as UserPrincipal)

        val headers = HttpHeaders()

        headers.contentType = contentType

        headers.setBearerAuth(tokens)

        return HttpEntity(data, headers)
    }

    protected fun assertSuccess(responseEntity: ResponseEntity<String>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.OK)
        assertEquals(responseEntity.headers.contentType, MediaType.APPLICATION_JSON)
        assertThat(responseEntity.body).isNotEmpty
    }

    protected fun assertUnauthorized(responseEntity: ResponseEntity<String>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.UNAUTHORIZED)
    }

    protected fun assertForbidden(responseEntity: ResponseEntity<String>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.FORBIDDEN)
    }

    protected fun assertHtmlFileSuccess(responseEntity: ResponseEntity<String>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.OK)
        assertEquals(responseEntity.headers.contentType, MediaType.TEXT_HTML)
        assertEquals(
            responseEntity.headers.contentDisposition,
            ContentDisposition.parse("attachment; filename=report.html")
        )
        assertThat(responseEntity.body).isEqualToIgnoringNewLines("<html><body><h1>TEST</h1></body></html>")
    }
}
