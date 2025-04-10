package packit.integration

import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import java.util.*

class PacketControllerTestHelper(val integrationTest: IntegrationTest)
{
    fun callGenerateTokenEndpoint(paths: Set<String>, packetId: String): ResponseEntity<String>
    {
        val params = mutableMapOf("id" to packetId)
        paths.forEachIndexed { index, path -> params["path$index"] = path }
        val pathsQueryParams = List(paths.size) { index -> "paths={path$index}" }.joinToString("&")
        return integrationTest.restTemplate.exchange(
            "/packets/{id}/files/token?$pathsQueryParams",
            HttpMethod.POST,
            integrationTest.getTokenizedHttpEntity(),
            params
        )
    }

    inline fun <reified T : Any> callStreamFileEndpoint(
        path: String,
        packetId: String,
        tokenId: UUID,
        filename: String
    ): ResponseEntity<T>
    {
        return integrationTest.restTemplate.exchange(
            "/packets/{id}/file?filename={filename}&token={token}&path={path}",
            HttpMethod.GET,
            integrationTest.getBareHttpEntity(),
            mapOf(
                "id" to packetId,
                "filename" to filename,
                "token" to tokenId,
                "path" to path
            )
        )
    }

    inline fun <reified T : Any> callStreamFilesZippedEndpoint(
        paths: Set<String>,
        packetId: String,
        tokenId: UUID,
        filename: String
    ): ResponseEntity<T>
    {
        val params = mutableMapOf(
            "id" to packetId,
            "filename" to filename,
            "token" to tokenId
        )
        paths.forEachIndexed { index, path -> params["path$index"] = path }
        val pathsQueryParams = List(paths.size) { index -> "paths={path$index}" }.joinToString("&")
        return integrationTest.restTemplate.exchange(
            "/packets/{id}/zip?filename={filename}&token={token}&$pathsQueryParams",
            HttpMethod.GET,
            integrationTest.getBareHttpEntity(),
            params
        )
    }
}
