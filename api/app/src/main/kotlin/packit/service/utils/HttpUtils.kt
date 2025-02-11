package packit.service.utils

import org.springframework.http.MediaType
import packit.contentTypes

fun filenameToMediaType(filename: String): String {
    val extension = filename.substringAfterLast(".")
    return contentTypes[extension] ?: MediaType.APPLICATION_OCTET_STREAM_VALUE
}