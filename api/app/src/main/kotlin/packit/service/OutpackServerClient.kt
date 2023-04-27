package packit.service

import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.util.MultiValueMap
import org.springframework.web.client.RestTemplate
import packit.AppConfig
import packit.model.OutpackMetadata
import packit.model.OutpackResponse

@Service
class OutpackServerClient(appConfig: AppConfig) {

    private val baseUrl: String = appConfig.outpackServerUrl

    private val restTemplate = RestTemplate()

    fun getChecksum(): String {
        return get<String>("checksum").data
    }

    fun getMetadata(): List<OutpackMetadata> {
        val url = "$baseUrl/metadata"
        val response = restTemplate.exchange(url,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                object: ParameterizedTypeReference<OutpackResponse<List<OutpackMetadata>>>() {})

        if (response.statusCode.isError) {
            throw Exception(response.body?.errors.toString())
        } else {
            return response.body!!.data
        }
    }

    private fun <T> get(urlFragment: String): OutpackResponse<T> {
        val url = "$baseUrl/$urlFragment"
        log.info("Fetching {}", url)

        val response = restTemplate.exchange(url,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                object: ParameterizedTypeReference<OutpackResponse<T>>() {})

        if (response.statusCode.isError) {
            throw Exception(response.body?.errors.toString())
        } else {
            return response.body!!
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(OutpackServerClient::class.java)
    }
}
