package packit.controllers

import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import packit.AppConfig
import java.io.IOException
import java.net.URL
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

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

@RestController
class LargeFilesController(
    val config: AppConfig,
)
{
    @GetMapping("/download-large-files")
    @Throws(IOException::class)
    fun downloadAndZipLargeFiles(response: HttpServletResponse) {
        // NB the 500mb file comes back as zip by default so we can't tell if we are zipping it
        val largeFileLink1 = "https://link.testfile.org/PDF200MB"
        val largeFileLink2 = config.outpackServerUrl + "/file/sha256:1c04a8f0157f267002f1e5a8cda59c17b26bd3097eb7467da970f7c288299d2b"

            // files can't be the same - causes java.util.zip.ZipException: duplicate entry: PDF200MB
            // but that could be a useful case for us to test our error handling!

        val allFilesToDownload: List<String> = java.util.List.of(
            largeFileLink1,
            largeFileLink2
        )

        response.contentType = "application/zip"
        response.setHeader("Content-Disposition", "attachment; filename=large-files.zip")

        ZipOutputStream(response.outputStream).use { zipOut ->
            for (fileLink in allFilesToDownload) {
                URL(fileLink).openStream().use { inputStream ->
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