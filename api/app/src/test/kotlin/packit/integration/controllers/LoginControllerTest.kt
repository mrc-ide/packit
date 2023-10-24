package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.model.LoginRequest

class LoginControllerTest : IntegrationTest()
{
    @Test
    fun `can login`()
    {
        val loginRequest = LoginRequest("test.user@example.com", "password")

        val headers = HttpHeaders()

        headers.contentType = MediaType.APPLICATION_JSON

        val requestEntity = HttpEntity(loginRequest, headers)

        val result: ResponseEntity<String> = restTemplate.exchange("/auth/login", HttpMethod.POST, requestEntity)

        assertSuccess(result)
    }

    @Test
    fun `can get config`()
    {
        val result = restTemplate.getForEntity("/auth/config", String::class.java)

        assertSuccess(result)
    }
}
