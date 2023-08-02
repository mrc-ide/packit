package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatusCode
import packit.integration.IntegrationTest
import kotlin.test.assertEquals

class OutpackControllerTest : IntegrationTest()
{
    @Test
    fun `can GET json from outpack_server`()
    {
        val result = restTemplate.getForEntity("/outpack/metadata/list", String::class.java)
        assertSuccess(result)
        jsonValidator.validateAgainstOutpackSchema(result.body!!, "location")
    }

    @Test
    fun `can return errors from outpack_server`()
    {
        val result = restTemplate.getForEntity("/outpack/bad", String::class.java)
        assertEquals(result.statusCode, HttpStatusCode.valueOf(404))
        jsonValidator.validateError(
                result.body!!, "NOT_FOUND",
                "This route does not exist"
        )
    }
}
