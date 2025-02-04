package packit.controllers

import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.io.IOException
import java.net.URL
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream


// Trying to adapt a blog post: https://woroniecki.pl/efficient-rest-endpoint-in-spring-boot-for-streaming-multiple-files-to-an-instant-zip-download/

@RestController
class LargeFilesController {
    @GetMapping("/download-large-files")
    @Throws(IOException::class)
    fun downloadAndZipLargeFiles(response: HttpServletResponse) {
        response.contentType = "application/zip"
        response.setHeader("Content-Disposition", "attachment; filename=large-files.zip")

        ZipOutputStream(response.outputStream).use { zipOut ->
            for (fileLink in ALL_FILES_TO_DOWNLOAD) {
                URL(fileLink).openStream().use { inputStream ->
                    val filename = fileLink.substring(fileLink.lastIndexOf("/") + 1)
                    zipOut.putNextEntry(ZipEntry(filename))

                    val buffer = ByteArray(1024)
                    var len: Int
                    while ((inputStream.read(buffer).also { len = it }) > 0) {
                        zipOut.write(buffer, 0, len)
                    }
                }
                zipOut.closeEntry()
            }
        }
    }

    companion object {
        // NB the 500mb file comes back as zip by default so we can't tell if we are zipping it
        private const val LARGE_FILE_LINK_1 = "https://link.testfile.org/PDF200MB"
        private const val LARGE_FILE_LINK_2 = "https://link.testfile.org/PDF100MB"

        // files can't be the same - causes java.util.zip.ZipException: duplicate entry: PDF200MB
        // but that could be a useful case for us to test our error handling!

        private val ALL_FILES_TO_DOWNLOAD: List<String> = java.util.List.of(
            LARGE_FILE_LINK_1,
            LARGE_FILE_LINK_2
        )
    }
}