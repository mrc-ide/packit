package packit.service

import org.springframework.core.io.ByteArrayResource
import org.springframework.stereotype.Service
import java.io.OutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

interface ZipService {
    fun zipByteArraysToOutputStream(resources: List<Pair<ByteArrayResource, String>>, output: OutputStream)
}

@Service
class BaseZipService : ZipService {
    override fun zipByteArraysToOutputStream(resources: List<Pair<ByteArrayResource, String>>, output: OutputStream) {
        ZipOutputStream(output).use { zipOutputStream ->
            resources.forEach { (resource, filename) ->
                try {
                    val zipEntry = ZipEntry(filename)
                    zipOutputStream.putNextEntry(zipEntry)
                    resource.inputStream.use { it.copyTo(zipOutputStream) }
                    zipOutputStream.closeEntry()
                } catch (e: Exception) {
                    // Handle exception (e.g., log the error)
                    e.printStackTrace()
                }
            }
        }
    }
}