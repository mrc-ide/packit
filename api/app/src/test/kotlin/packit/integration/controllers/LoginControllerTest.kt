package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.*
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.model.LoginWithPassword
import packit.model.LoginWithToken
import kotlin.test.assertEquals

class LoginControllerTestGithub : IntegrationTest()
{
    @Test
    fun `can get config`()
    {
        val result = restTemplate.getForEntity("/auth/config", String::class.java)

        assertSuccess(result)
    }

    @Test
    fun `can login with github API`()
    {

        val token = env.getProperty("GITHUB_ACCESS_TOKEN")!!

        assertThat(token.count()).isEqualTo(40) // sanity check access token correctly saved in environment
        val result = LoginTestHelper.getGithubLoginResponse(LoginWithToken(token), restTemplate)

        assertSuccess(result)
        val packitToken = ObjectMapper().readTree(result.body).get("token").asText()
        assertThat(packitToken.count()).isGreaterThan(0)
    }

    @Test
    fun `can receive 401 response when request login to API with invalid token`()
    {
        val result = LoginTestHelper.getGithubLoginResponse(LoginWithToken("badtoken"), restTemplate)
        assertUnauthorized(result)
    }

    @Test
    fun `returns forbidden when basic login is disabled`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("email@email.com", "password"), restTemplate)
        assertForbidden(result)
    }
}

@TestPropertySource(properties = ["auth.method=basic"])
@Sql("/test-users.sql")
class LoginControllerTestBasic : IntegrationTest()
{
    @Test
    fun `returns token on successful basic login`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("admin@example.com", "password"), restTemplate)

        assertEquals(result.statusCode, HttpStatus.OK)
        assertThat(result.body).contains("token")
    }

    @Test
    fun `returns forbidden when github login is disabled`()
    {
        val result = LoginTestHelper.getGithubLoginResponse(LoginWithToken("token"), restTemplate)
        assertForbidden(result)
    }

    @Test
    fun `returns unauthorized when user user is not found`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("notexists@example.com", "password"), restTemplate)

        assertUnauthorized(result)
    }

    @Test
    fun `returns unauthorized when password is incorrect`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("admin@example.com", "notcorrect"), restTemplate)

        assertUnauthorized(result)
    }
}

object LoginTestHelper
{
    fun getBasicLoginResponse(body: LoginWithPassword, restTemplate: TestRestTemplate): ResponseEntity<String>
    {
        val jsonBody = ObjectMapper().writeValueAsString(body)
        return getLoginResponse(jsonBody, restTemplate, "/auth/login/basic")
    }

    fun getGithubLoginResponse(body: LoginWithToken, restTemplate: TestRestTemplate): ResponseEntity<String>
    {
        val jsonBody = ObjectMapper().writeValueAsString(body)
        return getLoginResponse(jsonBody, restTemplate, "/auth/login/api")
    }

    private fun getLoginResponse(
        jsonBody: String,
        restTemplate: TestRestTemplate,
        url: String
    ): ResponseEntity<String>
    {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON

        val postEntity = HttpEntity(jsonBody, headers)
        return restTemplate.postForEntity<String>(url, postEntity, String::class.java)
    }
}
