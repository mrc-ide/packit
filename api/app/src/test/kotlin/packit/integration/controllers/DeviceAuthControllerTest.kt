package packit.integration.controllers

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.test.context.TestPropertySource
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.User
import packit.model.dto.DeviceAuthValidate
import packit.repository.UserRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@TestPropertySource(properties = ["auth.method=basic"])
class DeviceAuthControllerTest : IntegrationTest() {
    private lateinit var testUser: User

    @Autowired
    lateinit var userRepository: UserRepository

    @BeforeEach
    fun setupData() {
        testUser = User(
            username = "test.user@example.com",
            displayName = "test user",
            disabled = false,
            email = "test.user@example.com",
            userSource = "basic",
            roles = mutableListOf()
        )
        userRepository.save(testUser)
    }

    @AfterEach
    fun cleanupData() {
        userRepository.delete(testUser)
    }

    private fun getDeviceRequestResult(): JsonNode {
        val result = restTemplate.postForEntity("/deviceAuth", null, String::class.java)
        assertSuccess(result)
        return jacksonObjectMapper().readTree(result.body)
    }

    private fun getDeviceAuthRequestValidateResult(userCode: String): ResponseEntity<String> {
        val validateRequestBody = jacksonObjectMapper().writeValueAsString(
            DeviceAuthValidate(userCode)
        )
        return restTemplate.exchange(
            "/deviceAuth/validate",
            HttpMethod.POST,
            getTokenizedHttpEntity(data = validateRequestBody)
        )
    }

    private fun getTokenResult(
        deviceCode: String,
        grantType: String = "urn:ietf:params:oauth:grant-type:device_code"
    ): ResponseEntity<String> {
        val tokenRequestBody = "device_code=$deviceCode&grant_type=$grantType"
        return restTemplate.postForEntity(
            "/deviceAuth/token",
            getTokenizedHttpEntity(MediaType.APPLICATION_FORM_URLENCODED, tokenRequestBody),
            String::class.java
        )
    }

    private fun assertDeviceAuthRequestError(result: ResponseEntity<String>, expectedErrorCode: String) {
        assertBadRequest(result)
        val resultBody = jacksonObjectMapper().readTree(result.body as String)
        val error = resultBody["error"].asText()
        assertEquals(expectedErrorCode, error)
    }

    @Test
    fun `can make device auth request`() {
        val body = getDeviceRequestResult()
        assertEquals(300, body.get("expires_in").asInt())
        assertEquals("http://localhost:3000/device", body.get("verification_uri").asText())
        assertEquals(86, body.get("device_code").asText().length)
        assertEquals(9, body.get("user_code").asText().length)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can validate device auth user code`() {
        val deviceRequestResult = getDeviceRequestResult()
        val userCode = deviceRequestResult["user_code"].asText()
        val result = getDeviceAuthRequestValidateResult(userCode)
        assertEquals(HttpStatus.OK, result.statusCode)

        // Check expected error if attempt to validate a code which has already been validated
        val repeatResult = getDeviceAuthRequestValidateResult(userCode)
        assertDeviceAuthRequestError(repeatResult, "access_denied")
    }

    @Test
    fun `cannot validate user code if not authenticated`() {
        val deviceRequestResult = getDeviceRequestResult()
        val userCode = deviceRequestResult["user_code"].asText()
        val result = restTemplate.postForEntity("/deviceAuth/validate", userCode, String::class.java)

        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `cannot validate user code which does not exist`() {
        val result = getDeviceAuthRequestValidateResult("not a user code")
        assertDeviceAuthRequestError(result, "access_denied")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can fetch token for validated code`() {
        val deviceRequestResult = getDeviceRequestResult()
        val userCode = deviceRequestResult["user_code"].asText()
        // validate
        getDeviceAuthRequestValidateResult(userCode)

        // fetch the token
        val deviceCode = deviceRequestResult["device_code"].asText()
        val result = getTokenResult(deviceCode)

        assertSuccess(result)
        val resultBody = jacksonObjectMapper().readTree(result.body)
        assertTrue(resultBody["access_token"].asText().length > 0)
        assertEquals(24 * 3600, resultBody["expires_in"].asInt())
        assertEquals("Bearer", resultBody["token_type"].asText())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `fetch token returns expected error for incorrect grant type`() {
        val deviceRequestResult = getDeviceRequestResult()
        val userCode = deviceRequestResult["user_code"].asText()
        getDeviceAuthRequestValidateResult(userCode)

        val deviceCode = deviceRequestResult["device_code"].asText()
        val result = getTokenResult(deviceCode, "not a grant type")
        assertDeviceAuthRequestError(result, "unsupported_grant_type")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `fetch token returns expected error for unknown device code`() {
        val result = getTokenResult("not a device code")
        assertDeviceAuthRequestError(result, "access_denied")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `fetch token returns expected error for unvalidated device code`() {
        val deviceRequestResult = getDeviceRequestResult()
        val deviceCode = deviceRequestResult["device_code"].asText()
        val result = getTokenResult(deviceCode)
        assertDeviceAuthRequestError(result, "authorization_pending")
    }
}
