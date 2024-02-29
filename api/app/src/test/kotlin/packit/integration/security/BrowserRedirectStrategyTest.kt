package packit.integration.security

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.client.SimpleClientHttpRequestFactory
import packit.integration.IntegrationTest
import java.io.IOException
import java.net.HttpURLConnection
import kotlin.test.assertContains
import kotlin.test.assertEquals

internal class NoRedirectHttpRequestFactory : SimpleClientHttpRequestFactory() {
    @Throws(IOException::class)
    override fun prepareConnection(connection: HttpURLConnection, httpMethod: String) {
        super.prepareConnection(connection, httpMethod)
        connection.setInstanceFollowRedirects(false)
    }
}

class BrowserRedirectStrategyTest : IntegrationTest() {
    @BeforeEach
    override fun setup()
    {
        restTemplate.restTemplate.requestFactory = NoRedirectHttpRequestFactory()
    }

    @Test
    fun `redirects to browser on after authentication attempt`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/login/oauth2/code/github",
            HttpMethod.GET,
            HttpEntity(null, null)
        )
        assertEquals(result.statusCode, HttpStatus.FOUND) // 302
        assertContains(result.headers["Location"]?.get(0) ?: "", "http://localhost:3000/redirect")
    }
}
