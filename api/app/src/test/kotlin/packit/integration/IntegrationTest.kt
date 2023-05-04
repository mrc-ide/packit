package packit.integration

import org.assertj.core.api.Assertions.assertThat
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import kotlin.test.assertEquals

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class IntegrationTest
{
    @Autowired
    lateinit var restTemplate: TestRestTemplate

    protected fun assertSuccess(responseEntity: ResponseEntity<String>)
    {
        assertEquals(responseEntity.statusCode, HttpStatus.OK)
        assertEquals(responseEntity.headers.contentType, MediaType.APPLICATION_JSON)
        assertThat(responseEntity.body).isNotEmpty
    }
}
