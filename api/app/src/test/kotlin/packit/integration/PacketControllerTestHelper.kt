package packit.integration

import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import packit.model.dto.OneTimeTokenFiles
import java.util.*

class PacketControllerTestHelper(val integrationTest: IntegrationTest) {
    fun callGenerateTokenEndpoint(paths: Set<String>, packetId: String): ResponseEntity<String> {
        val params = mutableMapOf("id" to packetId)
        return integrationTest.restTemplate.exchange(
            "/packets/{id}/files/token",
            HttpMethod.POST,
            integrationTest.getTokenizedHttpEntity(data= OneTimeTokenFiles(paths.toList())),
            params
        )
    }

    inline fun <reified T : Any> callStreamFileEndpoint(
        path: String,
        packetId: String,
        tokenId: String,
        filename: String
    ): ResponseEntity<T> {
        return integrationTest.restTemplate.exchange(
            "/packets/{id}/file?path={path}&filename={filename}&token={token}",
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
        packetId: String,
        tokenId: String,
        filename: String
    ): ResponseEntity<T> {
        val params = mutableMapOf(
            "id" to packetId,
            "filename" to filename,
            "token" to tokenId
        )
        return integrationTest.restTemplate.exchange(
            "/packets/{id}/files/zip?filename={filename}&token={token}",
            HttpMethod.GET,
            integrationTest.getBareHttpEntity(),
            params
        )
    }
}
