package packit.service.utils

/**
 * Stream data from an input stream into an output stream, using a buffer as an intermediary to avoid writing to disk.
 *
 * @param inputStream The input stream.
 * @param outputStream The output stream.
 * @param bufferSize The size of the buffer to use. Larger buffer sizes are faster but use more memory.
 */
fun streamInputToOutput(
    inputStream: java.io.InputStream,
    outputStream: java.io.OutputStream,
    bufferSize: Int = 1024
) {
    val buffer = ByteArray(bufferSize)
    var len: Int
    // The read method returns the number of bytes read into the buffer, or -1 to indicate the end of the stream.
    while ((inputStream.read(buffer).also { len = it }) > 0) {
        outputStream.write(buffer, 0, len)
    }
}