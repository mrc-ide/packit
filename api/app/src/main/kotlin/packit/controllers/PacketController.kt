package packit.controllers

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.io.ByteArrayResource
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import packit.AppConfig
import packit.model.PacketMetadata
import packit.model.PageablePayload
import packit.model.dto.PacketDto
import packit.model.dto.PacketGroupSummary
import packit.model.toDto
import packit.service.GenericClient
import packit.service.PacketGroupService
import packit.service.PacketService
import java.io.IOException
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream


@RestController
@RequestMapping("/packets")
class PacketController(
    private val packetService: PacketService,
    private val packetGroupService: PacketGroupService,
    private val config: AppConfig,
//    private val zipService: ZipService,
//    private val outpackResponseStreamer: OutpackResponseStreamer,
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

    // Trying to use WebClient

//    @GetMapping("/{name}/{id}/zip")
//    @PreAuthorize("@authz.canReadPacket(#root, #id, #name)")
////     TODO: Verify authorization for accessing specific files: whether user has access to all files, or artefacts only.
//    fun downloadZip(
//        @PathVariable id: String,
//        @PathVariable name: String,
//        @RequestParam(required = true) hashes: List<String>,
//        @RequestParam(required = true) filenames: List<String>,
//    ): ResponseEntity<StreamingResponseBody>
//    {
//        val client = WebClient.create("http://localhost:8000")
//
//        // Call streaming version of 'get file' inside streamingResponseBody to make sure it happens on the thread pool;
//        // that is to say, to make sure it is not blocking the main thread. It's not that this implementation uses
//        // multiple threads itself, but rather that we want to allow multiple of these requests to be processed
//        // at the same time.
//        val streamingResponseBody = StreamingResponseBody { outputStream ->
//            ZipOutputStream(outputStream).use { zipOutputStream ->
//                hashes.mapIndexed { index, hash ->
//                    // Get an input stream for the file with given hash
//                    // (Use the filename provided by request)
//                    // Pass the inputStream to zip functions
//                    // error handle with try catch
//                    try {
//                        val filename = filenames[index]
//                        val zipEntry = ZipEntry(filename)
//                        zipOutputStream.putNextEntry(zipEntry)
//                        client.get()
//                            .uri("/file/$hash")
//                            .retrieve()
//                            .bodyToFlux<DataBuffer>()
//                            .doOnNext { dataBuffer ->
//                                val inputStream = dataBuffer.asInputStream(true)
//                                inputStream.use { it.copyTo(zipOutputStream) }
//                            }
//                            .doOnComplete {
//                                zipOutputStream.closeEntry()
//                            }
//                            // Block current thread until last data buffer is written to zip entry, to
//                            // ensure that the entry is complete before ... what? TODO: verify this is needed and isn't
//                            // made redundant by 'do on complete'.
////                            .blockLast()
//                            // "Use subscribe instead of blockLast to handle the response asynchronously."
//                            .subscribe()
//                    } catch (e: Exception) {
//                        e.printStackTrace() // TODO: proper error handling
//                    }
//                }
//            }
//        }
//
//        // TODO: Do we need to set content type to application/zip as in [link] or is that already happening? https://dzone.com/articles/streaming-data-with-spring-boot-restful-web-servic
//        return ResponseEntity
//            .ok()
//            .header("Content-Disposition", "attachment; filename=\"${name}.zip\"")
//            .body(streamingResponseBody)
//    }


    // Trying to use WebClient a second time


//    @GetMapping("/{name}/{id}/zip")
//    @PreAuthorize("@authz.canReadPacket(#root, #id, #name)")
//    fun downloadZip(
//        @PathVariable id: String,
//        @PathVariable name: String,
//        @RequestParam(required = true) hashes: List<String>,
//        @RequestParam(required = true) filenames: List<String>,
//    ): ResponseEntity<StreamingResponseBody> {
//        val client = WebClient.create("http://localhost:8000")
//
//        val streamingResponseBody = StreamingResponseBody { outputStream ->
//            ZipOutputStream(outputStream).use { zipOutputStream ->
//                val monos = hashes.mapIndexed { index, hash ->
//                    val filename = filenames[index]
//                    val zipEntry = ZipEntry(filename)
//                    zipOutputStream.putNextEntry(zipEntry)
//                    client.get()
//                        .uri("/file/$hash")
//                        .retrieve()
//                        .bodyToFlux<DataBuffer>()
//                        .doOnNext { dataBuffer ->
//                            val inputStream = dataBuffer.asInputStream(true)
//                            inputStream.use { it.copyTo(zipOutputStream) }
//                        }
//                        .doOnComplete {
//                            zipOutputStream.closeEntry()
//                        }
//                        .doOnError { e ->
//                            e.printStackTrace() // TODO: proper error handling
//                        }
//                        .then()
//                }
//
//                Mono.zip(monos).block() // Wait for all entries to be written before closing the ZipOutputStream
//            }
//        }
//
//        return ResponseEntity
//            .ok()
//            .header("Content-Disposition", "attachment; filename=\"${name}.zip\"")
//            .body(streamingResponseBody)
//    }



// To test the zip streaming,
// Create a new orderly packet called e.g. massive-file following the instructions in demos/README.md.
// Add the following R code in the orderly script to create an 870MB file, running the script as per demos/README.md:
// write.csv(matrix(rnorm(5e7), ncol = 10), "massive.csv", row.names = FALSE)
// orderly2::orderly_artefact("Massive file", "massive.csv")
// Run scripts/run-dependencies and wait for it to complete. At this point, the large file will have been stored in the
// outpack server, ready for us to try to download it.
// Create a build of the packit backend using ./api/scripts/build, and (crucially) run this build using a reduced heap
// size, e.g. 128MB, by running this command from the ./api directory:
// java -Xmx128m -jar app/build/libs/app.jar
// Run the front-end (if you want to test the full stack) from the /app directory as normal (npm start).



// Trying to adapt a blog post: https://woroniecki.pl/efficient-rest-endpoint-in-spring-boot-for-streaming-multiple-files-to-an-instant-zip-download/


    @GetMapping("/download-large-files")
    // TODO: authorization
    fun downloadAndZipLargeFiles(request: HttpServletRequest, response: HttpServletResponse) {
        val largeFileLink = config.outpackServerUrl + "/file/sha256:1c04a8f0157f267002f1e5a8cda59c17b26bd3097eb7467da970f7c288299d2b"

        // files can't be the same - causes "java.util.zip.ZipException: duplicate entry"
        // ^ could be useful for testing our error handling.

        val allFilesToDownload: List<String> = java.util.List.of(
            largeFileLink
        )

        response.contentType = "application/zip"
        response.setHeader("Content-Disposition", "attachment; filename=large-files.zip")

        ZipOutputStream(response.outputStream).use { zipOut ->
            for (fileLink in allFilesToDownload) {
                GenericClient.streamFile(fileLink, request, response) { serverResponse ->
                    serverResponse.body.use { inputStream ->
                        val filename = fileLink.substring(fileLink.lastIndexOf("/") + 1)
                        zipOut.putNextEntry(ZipEntry(filename))

                        val buffer = ByteArray(1024)
                        var len: Int
                        // The read method returns -1 to indicate the end of the stream
                        while ((inputStream.read(buffer).also { len = it }) > 0) {
//                        The write method takes three arguments:
//                        buffer: The byte array containing the data to be written.
//                        offset: The start offset in the data.
//                        length: The number of bytes to write.
                            zipOut.write(buffer, 0, len)
                        }
                    }
                    zipOut.closeEntry()
                }
            }
        }
    }
}
