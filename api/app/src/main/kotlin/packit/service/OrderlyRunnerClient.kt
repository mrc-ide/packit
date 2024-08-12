package packit.service

import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import packit.AppConfig
import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import packit.model.ServerResponse
import org.springframework.http.*
import packit.exceptions.PackitException
import packit.model.dto.OrderlyRunnerVersion

interface OrderlyRunner
{
    fun getVersion(): OrderlyRunnerVersion
}

@Service
class OrderlyRunnerClient(appConfig: AppConfig) : OrderlyRunner
{
    val baseUrl: String = appConfig.orderlyRunnerUrl
    private val restTemplate = RestTemplate()

    override fun getVersion() : OrderlyRunnerVersion
    {
        return getEndpoint("/")
    }

    private inline fun <reified T> getEndpoint(urlFragment: String): T
    {
        val url = "$baseUrl/$urlFragment"
        log.debug("Fetching {}", url)

        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity.EMPTY,
            object : ParameterizedTypeReference<ServerResponse<T>>()
            {}
        )

        return handleResponse(response)
    }

    private fun <T> handleResponse(response: ResponseEntity<ServerResponse<T>>): T
    {
        if (response.statusCode.isError)
        {
            // TODO we need proper error handling for the whole app
            // this is really just a placeholder
            @Suppress("TooGenericExceptionThrown")
            throw PackitException(response.body?.errors.toString())
        } else
        {
            return response.body!!.data
        }
    }

    companion object
    {
        private val log = LoggerFactory.getLogger(OrderlyRunnerClient::class.java)
    }
}
