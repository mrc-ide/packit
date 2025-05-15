package packit.integration

import org.junit.jupiter.api.Test
import org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.test.web.server.LocalManagementPort
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@AutoConfigureObservability
class MetricsTest(@LocalManagementPort managementPort: Int) : IntegrationTest() {
  val managementRestTemplate = TestRestTemplate(RestTemplateBuilder().rootUri("http://localhost:$managementPort"))

  @Test
  fun `can fetch prometheus metrics endpoint`() {
    val entity = managementRestTemplate.getForEntity("/prometheus", String::class.java)
    assertEquals(entity.statusCode, HttpStatus.OK)
    assertTrue(entity.headers.contentType!!.isMoreSpecific(MediaType.TEXT_PLAIN))
    assertTrue(entity.body!!.lines().any { it.startsWith("packit_api_build_info") })
  }

  @Test
  fun `can fetch health endpoint`() {
    val entity = managementRestTemplate.getForEntity("/health", String::class.java)
    assertSuccess(entity)
  }
}
