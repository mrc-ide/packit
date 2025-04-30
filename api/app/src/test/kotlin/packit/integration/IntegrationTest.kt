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

    protected fun <T>assertSuccess(responseEntity: ResponseEntity<T>)
    {
        assertEquals(HttpStatus.OK, responseEntity.statusCode, )
        assertEquals(MediaType.APPLICATION_JSON, responseEntity.headers.contentType)
    }

    protected fun <T>assertUnauthorized(responseEntity: ResponseEntity<T>)
    {
        assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.statusCode)
    }

    protected fun <T>assertForbidden(responseEntity: ResponseEntity<T>)
    {
        assertEquals(HttpStatus.FORBIDDEN, responseEntity.statusCode)
    }

    protected fun <T>assertBadRequest(responseEntity: ResponseEntity<T>)
    {
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.statusCode)
    }

    protected fun <T>assertNotFound(responseEntity: ResponseEntity<T>)
    {
        assertEquals(HttpStatus.NOT_FOUND, responseEntity.statusCode)
    }

    protected fun assertHtmlFileSuccess(responseEntity: ResponseEntity<String>)
    {
        assertEquals(HttpStatus.OK,responseEntity.statusCode)
        assertEquals(MediaType.TEXT_HTML, responseEntity.headers.contentType)
        assertEquals(
            ContentDisposition.parse("attachment; filename=report.html"),
            responseEntity.headers.contentDisposition
        )
        assertThat(responseEntity.body).isEqualToIgnoringNewLines("<html><body><h1>TEST</h1></body></html>")
    }
}
