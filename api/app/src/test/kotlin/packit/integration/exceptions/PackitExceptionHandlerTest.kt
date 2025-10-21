package packit.integration.exceptions

import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.*
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import kotlin.test.assertEquals

@WithAuthenticatedUser(authorities = ["packet.read"])
class PackitExceptionHandlerTest : IntegrationTest() {
    @Test
    fun `throws exception when client error occurred`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/nonsense",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }

    @Test
    fun `throws bad request exception when request body is not correct`() {
        val headers = HttpHeaders()
        val entity = HttpEntity(mapOf("ghtoken" to "xyz"), headers)

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/auth/login/api",
            HttpMethod.POST,
            entity
        )

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `throws unauthorized exception when token is invalid`() {
        val headers = HttpHeaders()
        val entity = HttpEntity(mapOf("token" to "xyz"), headers)

        // NB this test will hit the real github api
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/auth/login/api",
            HttpMethod.POST,
            entity
        )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    // TODO: Reinstate after check branch image
    /*@Test
    fun `throw 404 error when not found endpoint is called`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/wrong-endpoint",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }*/

    @Test
    fun `throw 405 when method not allowed`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/auth/login/api",
            HttpMethod.PUT,
            getTokenizedHttpEntity()
        )

        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, result.statusCode)
    }
}
