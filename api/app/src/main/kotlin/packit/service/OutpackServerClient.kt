package packit.service

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.client.ClientHttpResponse
import org.springframework.stereotype.Service
import packit.AppConfig
import packit.model.PacketMetadata
import packit.model.dto.OutpackMetadata
import java.io.OutputStream

interface OutpackServer
{
    fun getMetadata(from: Double? = null): List<OutpackMetadata>
    fun getMetadataById(id: String): PacketMetadata?
    fun getFileByHash(hash: String, output: OutputStream, preStream: (ClientHttpResponse) -> Unit = {})
    fun proxyRequest(
        urlFragment: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
        copyRequestBody: Boolean
    )
    fun getChecksum(): String
}

@Service
class OutpackServerClient(appConfig: AppConfig) : OutpackServer
{
    val baseUrl: String = appConfig.outpackServerUrl

    override fun proxyRequest(
        urlFragment: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
        copyRequestBody: Boolean
    )
    {
        GenericClient.proxyRequest(constructUrl(urlFragment), request, response, copyRequestBody)
    }

    override fun getMetadataById(id: String): PacketMetadata
    {
        return GenericClient.get(constructUrl("metadata/$id/json"))
    }

    override fun getFileByHash(hash: String, output: OutputStream, preStream: (ClientHttpResponse) -> Unit)
    {
        GenericClient.streamingGet(constructUrl("file/$hash"), output, preStream)
    }

    override fun getChecksum(): String
    {
        return GenericClient.get(constructUrl("checksum"))
    }

    override fun getMetadata(from: Double?): List<OutpackMetadata>
    {
        var url = "packit/metadata"
        if (from != null)
        {
            url = "$url?known_since=$from"
        }
        return GenericClient.get(constructUrl(url))
    }

    private fun constructUrl(urlFragment: String): String
    {
        return "$baseUrl/$urlFragment"
    }
}
