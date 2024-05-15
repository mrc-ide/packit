package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.*
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.TestPropertySource
import packit.integration.IntegrationTest
import packit.model.User
import packit.model.dto.LoginWithPassword
import packit.model.dto.LoginWithToken
import packit.model.dto.UpdatePassword
import packit.repository.UserRepository
import java.time.Instant
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
class LoginControllerTestBasic : IntegrationTest()
{
    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var passwordEncoder: PasswordEncoder

    private lateinit var testUser: User
    val userPassword = "password"

    @BeforeEach
    fun setupData()
    {
        testUser = User(
            username = "test@email.com",
            displayName = "test user",
            disabled = false,
            email = "test@email.com",
            userSource = "basic",
            roles = mutableListOf(),
            password = passwordEncoder.encode(userPassword),
            lastLoggedIn = Instant.now()
        )
        userRepository.save(testUser)
    }

    @AfterEach
    fun cleanupData()
    {
        userRepository.delete(testUser)
    }

    @Test
    fun `returns token on successful basic login`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(
                LoginWithPassword(testUser.username, "password"),
                restTemplate
            )

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

    @Test
    fun `updatePassword can update a user's password`()
    {
        val newPassword = "newPassword"
        val updatePassword = UpdatePassword(userPassword, newPassword)

        val result = LoginTestHelper.getUpdatePasswordResponse(updatePassword, restTemplate, testUser.username)

        assertEquals(result.statusCode, HttpStatus.NO_CONTENT)

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

    fun getUpdatePasswordResponse(
        body: UpdatePassword,
        restTemplate: TestRestTemplate,
        username: String
    ): ResponseEntity<String>
    {
        val jsonBody = ObjectMapper().writeValueAsString(body)
        return getLoginResponse(jsonBody, restTemplate, "/auth/${username}/basic/password")
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
