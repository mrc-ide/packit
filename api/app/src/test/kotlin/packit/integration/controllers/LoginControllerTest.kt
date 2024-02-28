package packit.integration.controllers

import org.assertj.core.api.Assertions.assertThat
import com.fasterxml.jackson.databind.ObjectMapper
import kotlin.test.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import packit.integration.IntegrationTest
import packit.model.LoginWithToken

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
        val postBody = LoginWithToken(token)

        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON

        val objectMapper = ObjectMapper()
        val jsonString = objectMapper.writeValueAsString(postBody)
        val postEntity =  HttpEntity(jsonString, headers)
        val result = restTemplate.postForEntity<String>("/auth/login/api", postEntity, String::class.java)

        assertSuccess(result)
        val packitToken = objectMapper.readTree(result.body).get("token").asText()
        assertThat(packitToken.count()).isGreaterThan(0)
    }
}
