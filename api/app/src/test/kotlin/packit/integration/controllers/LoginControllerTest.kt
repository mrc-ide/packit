package packit.integration.controllers

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockserver.integration.ClientAndServer
import org.mockserver.junit.jupiter.MockServerExtension
import org.mockserver.junit.jupiter.MockServerSettings
import org.mockserver.model.HttpRequest.request
import org.mockserver.model.HttpResponse.response
import org.mockserver.model.JsonBody
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
import packit.repository.RoleRepository
import packit.repository.UserRepository
import packit.security.provider.TokenDecoder
import packit.testing.TestJwtIssuer
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class LoginControllerTestGithub : IntegrationTest() {
    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    @AfterEach
    fun cleanupData() {
        val githubUsers = userRepository.findAll().filter { it.userSource == "github" }
        githubUsers.forEach {
            val userName = it.username
            if (userRepository.existsByUsername(userName)) {
                userRepository.deleteByUsername(userName)
            }

            if (roleRepository.existsByName(userName)) {
                roleRepository.deleteByName(userName)
            }
        }
    }

    @Test
    fun `can get config`() {
        val result = restTemplate.getForEntity("/auth/config", String::class.java)

        assertSuccess(result)
    }

    @Test
    fun `can login with github API`() {

        val token = env.getProperty("GITHUB_ACCESS_TOKEN")!!

        assertThat(token.count()).isEqualTo(40) // sanity check access token correctly saved in environment
        val result = LoginTestHelper.getGithubLoginResponse(LoginWithToken(token), restTemplate)

        assertSuccess(result)
        val packitToken = jacksonObjectMapper().readTree(result.body).get("token").asText()
        assertThat(packitToken.count()).isGreaterThan(0)
    }

    @Test
    fun `can receive 401 response when request login to API with invalid token`() {
        val result = LoginTestHelper.getGithubLoginResponse(LoginWithToken("badtoken"), restTemplate)
        assertUnauthorized(result)
    }

    @Test
    fun `basic login returns forbidden when basic login is disabled`() {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("email@email.com", "password"), restTemplate)
        assertForbidden(result)
    }

    @Test
    fun `preauth login returns forbidden when preauth login is disabled`() {
        val result =
            LoginTestHelper.getPreauthLoginResponse(
                "preauth.user", "Preauth User", "preauth.user@example.com",
                restTemplate
            )
        assertForbidden(result)
    }
}

@TestPropertySource(properties = ["auth.method=preauth"])
class LoginControllerTestPreAuth : IntegrationTest() {
    private val userEmail = "test.user@example.com"
    private val userName = "test.user"
    private val userDisplayName = "Test User"

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    @Autowired
    private lateinit var tokenDecoder: TokenDecoder

    @AfterEach
    fun cleanupData() {
        if (userRepository.existsByUsername(userName)) {
            userRepository.deleteByUsername(userName)
        }

        if (roleRepository.existsByName(userName)) {
            roleRepository.deleteByName(userName)
        }
    }

    @Test
    fun `can login without existing user`() {
        val result =
            LoginTestHelper.getPreauthLoginResponse(
                userName, userDisplayName, userEmail, restTemplate
            )

        assertSuccess(result)
        val packitToken = jacksonObjectMapper().readTree(result.body).get("token").asText()
        val decodedToken = tokenDecoder.decode(packitToken)
        assertEquals(decodedToken.getClaim("userName").asString(), userName)
        assertTrue { userRepository.existsByUsername(userName) }
    }

    @Test
    fun `can login with existing user`() {
        val adminRole = roleRepository.findByName("ADMIN")!!
        val testUser = User(
            username = userName,
            displayName = userDisplayName,
            disabled = false,
            email = userEmail,
            userSource = "preauth",
            roles = mutableListOf(),
            password = null,
            lastLoggedIn = null
        )
        userRepository.save(testUser)
        val now = Instant.now()

        val result =
            LoginTestHelper.getPreauthLoginResponse(
                userName, userDisplayName, userEmail, restTemplate
            )

        assertSuccess(result)
        val packitToken = jacksonObjectMapper().readTree(result.body).get("token").asText()
        val decodedToken = tokenDecoder.decode(packitToken)
        assertEquals(decodedToken.getClaim("userName").asString(), userName)

        val updatedUser = userRepository.findByUsernameAndUserSource(userName, "preauth")
        assertThat(updatedUser!!.lastLoggedIn).isAfterOrEqualTo(now)
    }

    @Test
    fun `returns 400 when username header not provided`() {
        val result =
            LoginTestHelper.getPreauthLoginResponse(
                null, userDisplayName, userEmail, restTemplate
            )
        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
        val packitToken = jacksonObjectMapper().readTree(result.body).get("token")
        assertThat(packitToken).isNull()
    }

    @Test
    fun `email and display name headers are optional`() {
        val result =
            LoginTestHelper.getPreauthLoginResponse(
                userName, null, null, restTemplate
            )

        assertSuccess(result)
        val packitToken = jacksonObjectMapper().readTree(result.body).get("token").asText()
        assertThat(packitToken.count()).isGreaterThan(0)
        assertThat(userRepository.existsByUsername(userName)).isTrue()
    }
}

@TestPropertySource(properties = ["auth.method=basic"])
class LoginControllerTestBasic : IntegrationTest() {
    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var passwordEncoder: PasswordEncoder

    private lateinit var testUser: User
    val userPassword = "password"

    @BeforeEach
    fun setupData() {
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
    fun cleanupData() {
        userRepository.delete(testUser)
    }

    @Test
    fun `returns token on successful basic login`() {
        val result =
            LoginTestHelper.getBasicLoginResponse(
                LoginWithPassword(testUser.username, "password"),
                restTemplate
            )

        assertEquals(result.statusCode, HttpStatus.OK)
        assertThat(result.body).contains("token")
    }

    @Test
    fun `returns forbidden when github login is disabled`() {
        val result = LoginTestHelper.getGithubLoginResponse(LoginWithToken("token"), restTemplate)
        assertForbidden(result)
    }

    @Test
    fun `returns unauthorized when user user is not found`() {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("notexists@example.com", "password"), restTemplate)

        assertUnauthorized(result)
    }

    @Test
    fun `returns unauthorized when password is incorrect`() {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("admin@example.com", "notcorrect"), restTemplate)

        assertUnauthorized(result)
    }

    @Test
    fun `updatePassword can update a user's password`() {
        val newPassword = "newPassword"
        val updatePassword = UpdatePassword(userPassword, newPassword)

        val result = LoginTestHelper.getUpdatePasswordResponse(updatePassword, restTemplate, testUser.username)

        assertEquals(result.statusCode, HttpStatus.NO_CONTENT)
    }
}

@ExtendWith(MockServerExtension::class)
@MockServerSettings(ports = [8787])
@TestPropertySource(
    properties = [
        "auth.service.audience=packit",
        "auth.service.policies[0].jwkSetUri=http://127.0.0.1:8787/jwks.json",
        "auth.service.policies[0].issuer=issuer",
        "auth.service.policies[0].granted-permissions=outpack.read,outpack.write",
    ]
)
class LoginControllerTestService(val jwksServer: ClientAndServer) : IntegrationTest() {
    val trustedIssuer = TestJwtIssuer()

    @Autowired
    private lateinit var tokenDecoder: TokenDecoder

    @BeforeEach
    fun configureJwksServer() {
        jwksServer.`when`(request().withMethod("GET").withPath("/jwks.json"))
            .respond(response().withStatusCode(200).withBody(JsonBody(trustedIssuer.jwkSet.toString())))
    }

    @AfterEach
    fun resetJwksServer() {
        jwksServer.reset()
    }

    @Test
    fun `can get expected audience`() {
        val result = restTemplate.getForEntity("/auth/login/service/audience", JsonNode::class.java)
        assertSuccess(result)
        assertEquals(result.body?.required("audience")?.textValue(), "packit")
    }

    @Test
    fun `can login with external JWT`() {
        val externalToken = trustedIssuer.issue { builder ->
            builder.issuer("issuer")
            builder.audience(listOf("packit"))
        }
        val result = restTemplate.postForEntity(
            "/auth/login/service",
            LoginWithToken(externalToken),
            JsonNode::class.java,
        )
        assertSuccess(result)

        val token = tokenDecoder.decode(result.body?.required("token")?.textValue()!!)
        assertEquals(token.getClaim("userName").asString(), "SERVICE")
        assertThat(token.getClaim("au").asList(String::class.java))
            .containsExactlyInAnyOrder("outpack.read", "outpack.write")
    }

    @Test
    fun `returns unauthorized when token is signed with different key`() {
        val untrustedIssuer = TestJwtIssuer()
        val externalToken = untrustedIssuer.issue { builder ->
            builder.issuer("issuer")
            builder.audience(listOf("packit"))
        }
        val result = restTemplate.postForEntity(
            "/auth/login/service",
            LoginWithToken(externalToken),
            JsonNode::class.java
        )
        assertUnauthorized(result)
    }

    @Test
    fun `returns unauthorized when token has invalid claims`() {
        val token = trustedIssuer.issue { builder ->
            builder.issuer("issuer")
            builder.audience(listOf("not-packit"))
        }
        val result = restTemplate.postForEntity("/auth/login/service", LoginWithToken(token), String::class.java)
        assertUnauthorized(result)
    }
}

object LoginTestHelper {
    fun getBasicLoginResponse(body: LoginWithPassword, restTemplate: TestRestTemplate): ResponseEntity<String> {
        val jsonBody = jacksonObjectMapper().writeValueAsString(body)
        return getLoginResponse(jsonBody, restTemplate, "/auth/login/basic")
    }

    fun getPreauthLoginResponse(
        user: String?,
        displayName: String?,
        email: String?,
        restTemplate: TestRestTemplate
    ): ResponseEntity<String> {
        val headers = HttpHeaders()
        if (user != null) {
            headers.add("X-Remote-User", user)
        }
        if (displayName != null) {
            headers.add("X-Remote-Name", displayName)
        }
        if (email != null) {
            headers.add("X-Remote-Email", email)
        }
        val requestEntity = HttpEntity<String?>(headers)
        return restTemplate.exchange(
            "/auth/login/preauth", HttpMethod.GET, requestEntity, String::class.java, {}
        )
    }

    fun getGithubLoginResponse(body: LoginWithToken, restTemplate: TestRestTemplate): ResponseEntity<String> {
        val jsonBody = jacksonObjectMapper().writeValueAsString(body)
        return getLoginResponse(jsonBody, restTemplate, "/auth/login/api")
    }

    fun getUpdatePasswordResponse(
        body: UpdatePassword,
        restTemplate: TestRestTemplate,
        username: String
    ): ResponseEntity<String> {
        val jsonBody = jacksonObjectMapper().writeValueAsString(body)
        return getLoginResponse(jsonBody, restTemplate, "/auth/$username/basic/password")
    }

    private fun getLoginResponse(
        jsonBody: String,
        restTemplate: TestRestTemplate,
        url: String
    ): ResponseEntity<String> {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON

        val postEntity = HttpEntity(jsonBody, headers)
        return restTemplate.postForEntity<String>(url, postEntity, String::class.java)
    }
}
