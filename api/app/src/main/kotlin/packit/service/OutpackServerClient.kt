package packit.service

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Service
import packit.AppConfig
import packit.model.PacketMetadata
import packit.model.dto.GitBranches
import packit.model.dto.OutpackMetadata

interface OutpackServer
{
    fun getMetadata(from: Double? = null): List<OutpackMetadata>
    fun getMetadataById(id: String): PacketMetadata?
    fun getFileByHash(hash: String): Pair<ByteArray, HttpHeaders>?
    fun proxyRequest(
        urlFragment: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
        copyRequestBody: Boolean
    )
    fun getChecksum(): String
    fun gitFetch()
    fun getBranches(): GitBranches
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

    override fun getFileByHash(hash: String): Pair<ByteArray, HttpHeaders>
    {
        return GenericClient.getFile(constructUrl("file/$hash"))
    }

    override fun getChecksum(): String
    {
        return GenericClient.get(constructUrl("checksum"))
    }

    override fun gitFetch()
    {
        return GenericClient.post(constructUrl("git/fetch"))
    }

    override fun getBranches(): GitBranches
    {
        return GenericClient.get(constructUrl("git/branches"))
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
