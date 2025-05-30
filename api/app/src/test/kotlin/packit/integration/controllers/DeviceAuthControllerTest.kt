package packit.integration.controllers

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import kotlin.test.Test
import kotlin.test.assertEquals

class DeviceAuthControllerTest: IntegrationTest() {
    private fun getDeviceRequestResult(): JsonNode {
        val result = restTemplate.postForEntity("/deviceAuth", null, String::class.java)
        assertSuccess(result)
        return jacksonObjectMapper().readTree(result.body)
    }

    private fun getDeviceAuthRequestValidateResult(userCode: String): ResponseEntity<Unit> {
        return restTemplate.exchange(
            "/deviceAuth/validate",
            HttpMethod.POST,
            getTokenizedHttpEntity(MediaType.TEXT_PLAIN, userCode)
        )
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

        // Should get 400 for unknown code
        val unknownCodeResult = getDeviceAuthRequestValidateResult("not a real code")
        assertBadRequest(unknownCodeResult)
    }

    @Test
    fun `cannot validate device auth user code if not authenticated`() {
        val deviceRequestResult = getDeviceRequestResult()
        val userCode = deviceRequestResult["user_code"].asText()
        val result = restTemplate.postForEntity("/deviceAuth/validate", userCode, String::class.java)

        assertUnauthorized(result)
    }
}