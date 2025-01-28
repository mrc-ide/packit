package packit.controllers

import org.springframework.http.MediaType
import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.dto.PacketDto
import packit.model.dto.PacketGroupSummary
import packit.model.toDto
import packit.service.PacketGroupService
import packit.service.PacketService
import packit.service.ZipService

@RestController
@RequestMapping("/packets")
class PacketController(
    private val packetService: PacketService,
    private val packetGroupService: PacketGroupService,
    private val zipService: ZipService,
)
{
    @GetMapping
    fun pageableIndex(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filterName: String,
        @RequestParam(required = false, defaultValue = "") filterId: String,
    ): ResponseEntity<Page<PacketDto>>
    {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(packetService.getPackets(payload, filterName, filterId).map { it.toDto() })
    }

    @GetMapping("/{name}")
    fun getPacketsByName(
        @PathVariable name: String,
    ): ResponseEntity<List<PacketDto>>
    {
        return ResponseEntity.ok(
            packetService.getPacketsByName(name).map { it.toDto() }
        )
    }

    @GetMapping("/packetGroupSummaries")
    fun getPacketGroupSummaries(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filter: String,
    ): ResponseEntity<Page<PacketGroupSummary>>
    {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(packetGroupService.getPacketGroupSummaries(payload, filter))
    }

    @GetMapping("/metadata/{id}")
    @PreAuthorize("@authz.canReadPacketMetadata(#root, #id)")
    fun findPacketMetadata(@PathVariable id: String): ResponseEntity<PacketMetadata>
    {
        return ResponseEntity.ok(packetService.getMetadataBy(id))
    }

    @GetMapping("/file/{id}")
    @PreAuthorize("@authz.canReadPacketMetadata(#root, #id)")
    @ResponseBody
    fun findFile(
        @PathVariable id: String,
        @RequestParam hash: String,
        @RequestParam inline: Boolean = false,
        @RequestParam filename: String,
    ): ResponseEntity<ByteArrayResource>
    {
        val response = packetService.getFileByHash(hash, inline, filename)

        return ResponseEntity
            .ok()
            .headers(response.second)
            .body(response.first)
    }

    @GetMapping("/{name}/{id}/zip")
    @PreAuthorize("@authz.canReadPacket(#root, #id, #name)")
    // TODO: Verify authorization for accessing specific files: whether user has access to all files, or artefacts only.
    fun downloadZip(
        @PathVariable id: String,
        @PathVariable name: String,
        @RequestParam(required = true) hashes: List<String>,
        @RequestParam(required = true) filenames: List<String>,
    ): ResponseEntity<StreamingResponseBody> // Note: when using this option it is highly recommended to configure explicitly the TaskExecutor used in Spring MVC for executing asynchronous requests. Both the MVC Java config and the MVC namespaces provide options to configure asynchronous handling. If not using those, an application can set the taskExecutor property of RequestMappingHandlerAdapter.
    {
        val filesWithNames = hashes.mapIndexed { index, hash ->
            val fileResource = packetService.getFileByHash(hash, false, hash).first
            fileResource to filenames[index]
        }

        val streamingResponseBody = StreamingResponseBody { outputStream ->
            zipService.zipByteArraysToOutputStream(filesWithNames, outputStream)
        }

        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=\"${name}.zip\"")
            .body(streamingResponseBody)
    }
}
