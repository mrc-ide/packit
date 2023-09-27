package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.*
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import kotlin.test.assertContains
import kotlin.test.assertEquals

class OutpackControllerTest : IntegrationTest()
{
    val testPacket = "{\n" +
            "  \"schema_version\": \"0.0.1\",\n" +
            "  \"name\": \"modup-201707-queries1\",\n" +
            "  \"id\": \"20170818-164847-7574883b\",\n" +
            "  \"time\": {\n" +
            "    \"start\": 1503074938.2232,\n" +
            "    \"end\": 1503074938.2232\n" +
            "  },\n" +
            "  \"parameters\": null,\n" +
            "  \"files\": [],\n" +
            "  \"depends\": [],\n" +
            "  \"script\": [\n" +
            "    \"script.R\"\n" +
            "  ],\n" +
            "  \"session\": {\n" +
            "  },\n" +
            "  \"custom\": null\n" +
            "}"

    @Test
    @WithAuthenticatedUser
    fun `can GET json from outpack_server`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/outpack/metadata/list",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
        jsonValidator.validateAgainstOutpackSchema(result.body!!, "location")
        assert(jsonValidator.getData(result.body!!).asIterable().count() > 1)
    }

    @Test
    @WithAuthenticatedUser
    fun `can GET plain text from outpack_server`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/outpack/metadata/20230427-150755-2dbede93/text",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(result.statusCode, HttpStatus.OK)
        assert(result.headers.contentType.toString().contains("text/plain"))
        assertContains(result.body!!, "\"name\":\"explicit\"")
    }

    @Test
    @WithAuthenticatedUser
    fun `can GET file from outpack_server`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/outpack/file/sha256:1e2e932aa25493f54366fef8ec996a24ff3456c6b30d4ff6fa753e6263cf8ee0",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.headers.contentType, MediaType.APPLICATION_OCTET_STREAM)
        assertContains(result.body!!, "files <- dir(pattern = \"*.csv\")\n")
    }

    @Test
    @WithAuthenticatedUser
    fun `can POST text to outpack_server`()
    {
        val result = restTemplate.postForEntity(
            "/outpack/packet/sha256:ad153e5f6720dde3161b229ef73ca2b302fb95a37a092a2c8e3350a8ed6713d4",
            getTokenizedHttpEntity(MediaType.TEXT_PLAIN, testPacket),
            String::class.java
        )
        assertSuccess(result)
        jsonValidator.validateAgainstOutpackSchema(result.body!!, "null-response")
    }

    @Test
    @WithAuthenticatedUser
    fun `can POST file to outpack_server`()
    {
        val result = restTemplate.postForEntity(
            "/outpack/file/sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            getTokenizedHttpEntity(MediaType.APPLICATION_OCTET_STREAM, "test"),
            String::class.java
        )
        assertSuccess(result)
        jsonValidator.validateAgainstOutpackSchema(result.body!!, "null-response")
    }

    @Test
    @WithAuthenticatedUser
    fun `can return GET errors from outpack_server`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/outpack/bad",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(result.statusCode, HttpStatusCode.valueOf(404))
        jsonValidator.validateError(
                result.body!!, "NOT_FOUND",
                "This route does not exist"
        )
    }

    @Test
    @WithAuthenticatedUser
    fun `can return POST errors from outpack_server`()
    {
        val result = restTemplate.postForEntity(
            "/outpack/packet/badhash",
            getTokenizedHttpEntity(MediaType.TEXT_PLAIN, testPacket),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatusCode.valueOf(400))
        jsonValidator.validateError(
                result.body!!, "invalid input parameter",
                "Invalid hash format 'badhash'"
        )
    }
}
