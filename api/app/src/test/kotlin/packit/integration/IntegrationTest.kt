package packit.integration

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

    fun getTokenizedHttpEntity(
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

    fun getBareHttpEntity(): HttpEntity<Any>
    {
        return HttpEntity(null, HttpHeaders())
    }

    protected fun <T>assertSuccess(responseEntity: ResponseEntity<T>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.OK)
        assertEquals(responseEntity.headers.contentType, MediaType.APPLICATION_JSON)
    }

    protected fun <T>assertUnauthorized(responseEntity: ResponseEntity<T>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.UNAUTHORIZED)
    }

    protected fun <T>assertForbidden(responseEntity: ResponseEntity<T>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.FORBIDDEN)
    }

    protected fun <T>assertBadRequest(responseEntity: ResponseEntity<T>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.BAD_REQUEST)
    }

    protected fun <T>assertNotFound(responseEntity: ResponseEntity<T>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.NOT_FOUND)
    }
}
