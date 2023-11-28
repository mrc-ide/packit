package packit.integration.exceptions

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.*
import org.springframework.http.client.SimpleClientHttpRequestFactory
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import kotlin.test.assertEquals

@WithAuthenticatedUser
class PackitExceptionHandlerTest : IntegrationTest()
{
    @BeforeEach
    fun setup() {
        // Default test rest template settings throw when examine
        // status of 401 responses, using alternative factory fixes this
        // https://stackoverflow.com/questions/16748969
        val factory = SimpleClientHttpRequestFactory()
        factory.setOutputStreaming(false)
        restTemplate.restTemplate.requestFactory = factory
    }

    @Test
    fun `throws exception when client error occurred`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/metadata/nonsense",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(result.statusCode, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @Test
    fun `throws bad request exception when request body is not correct`()
    {
        val headers = HttpHeaders()
        val entity = HttpEntity(mapOf("token" to "xyz"), headers)

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/auth/login/github",
            HttpMethod.POST,
            entity
        )

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `throws unauthorized exception when token is invalid`()
    {
        val headers = HttpHeaders()
        val entity = HttpEntity(mapOf("githubtoken" to "xyz"), headers)

        // NB this test will hit the real github api
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/auth/login/github",
            HttpMethod.POST,
            entity
        )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }
}
