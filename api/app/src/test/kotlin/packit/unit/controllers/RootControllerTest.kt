package packit.unit.controllers

import org.springframework.http.HttpStatus
import packit.controllers.RootController
import kotlin.test.Test
import kotlin.test.assertEquals

class RootControllerTest {
    @Test
    fun `root returns 200 with welcome message`() {
        val result = RootController().root()
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("Welcome to Packit API!", result.body)
    }
}
