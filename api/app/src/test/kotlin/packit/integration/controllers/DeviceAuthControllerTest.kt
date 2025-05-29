package packit.integration.controllers

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import packit.integration.IntegrationTest
import kotlin.test.Test
import kotlin.test.assertEquals

class DeviceAuthControllerTest: IntegrationTest() {
    @Test
    fun `can make device auth request`() {
        val result = restTemplate.postForEntity("/deviceAuth", null, String::class.java)

        assertSuccess(result)
        val body = jacksonObjectMapper().readTree(result.body)
        assertEquals(300, body.get("expires_in").asInt())
        assertEquals("http://localhost:3000/device", body.get("verification_uri").asText())
        assertEquals(86, body.get("device_code").asText().length)
        assertEquals(9, body.get("user_code").asText().length)
    }
}