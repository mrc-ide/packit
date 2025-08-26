package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import packit.integration.IntegrationTest
import kotlin.test.assertEquals

class RootControllerTest : IntegrationTest() {
    @Test
    fun `root returns 200 with welcome message`() {
        val result = restTemplate.getForEntity("/", String::class.java)
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("Welcome to Packit API!", result.body)
    }
}
