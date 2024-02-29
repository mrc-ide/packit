package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.*
import packit.integration.IntegrationTest
import packit.model.LoginWithToken
import kotlin.test.assertEquals

class LoginControllerTest : IntegrationTest()
{
    @Test
    fun `can get config`()
    {
        val result = restTemplate.getForEntity("/auth/config", String::class.java)

        assertSuccess(result)
    }

    @Test
    fun `can login with API`()
    {
        val token = env.getProperty("GITHUB_ACCESS_TOKEN")!!
        assertThat(token.count()).isEqualTo(40) // sanity check access token correctly saved in environment
        val result = getLoginResponse(token)

        assertSuccess(result)
        val packitToken = ObjectMapper().readTree(result.body).get("token").asText()
        assertThat(packitToken.count()).isGreaterThan(0)
    }

    @Test
    fun `can receive 401 response when login to API with invalid token`()
    {
        val result = getLoginResponse("badtoken")
        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    private fun getLoginResponse(token: String): ResponseEntity<String>
    {
        val postBody = LoginWithToken(token)

        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON

        val jsonString = ObjectMapper().writeValueAsString(postBody)
        val postEntity = HttpEntity(jsonString, headers)
        return restTemplate.postForEntity<String>("/auth/login/api", postEntity, String::class.java)
    }
}
