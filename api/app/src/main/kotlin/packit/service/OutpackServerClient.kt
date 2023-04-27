package packit.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import packit.model.OutpackResponse

@Service
class OutpackServerClient {

    @Value("\${outpack.server.url}")
    private val baseUrl: String? = null
    private val restTemplate = RestTemplate()

    fun getChecksum(): Any? {
        val response = restTemplate.getForEntity("$baseUrl/checksum",
                OutpackResponse::class.java)
        if (response.statusCode.isError) {
            throw Exception(response.body?.errors.toString())
        } else {
            return response.body?.data
        }
    }
}
