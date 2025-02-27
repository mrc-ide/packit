package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.*
import org.mockito.kotlin.*
import org.mockito.kotlin.any
import org.springframework.data.domain.PageImpl
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.client.ClientHttpResponse
import org.springframework.mock.web.MockHttpServletResponse
import packit.controllers.PacketController
import packit.exceptions.PackitException
import packit.model.*
import packit.service.OneTimeTokenService
import packit.service.PacketService
import java.io.OutputStream
import java.time.Instant
import java.util.UUID
import kotlin.test.assertEquals

class PacketControllerTest
{
    val now = Instant.now().epochSecond.toDouble()

    private val packetId = "20180818-164847-7574883b"
    private val packetMetadata = listOf(
        PacketMetadata(
            packetId,
            "test",
            mapOf("name" to "value"),
            listOf(
                FileMetadata(
                "hello.txt",
                size = 49,
                hash = "sha256:exampleHash"
            )
            ),
            GitMetadata("git", "sha", emptyList()),
            TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
            emptyMap(),
            emptyList()
        ),
        PacketMetadata(
            "20170819-164847-7574883b",
            "test",
            mapOf("name" to "value"),
            emptyList(),
            null,
            TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
            emptyMap(),
            emptyList()
        )
    )

    private val packets = listOf(
        Packet(
            packetId,
            "test1",
            "test name1",
            mapOf("name" to "value"),
            true,
            now,
            now,
            now,
        ),
        Packet(
            "20170819-164847-7574883b",
            "test3",
            "test name3",
            mapOf("alpha" to true),
            false,
            1690902034.0,
            1690902034.0,
            1690902034.0

        )
    )

    private val mockPageablePackets = PageImpl(packets)
    private val mockClientHttpResponse = mock<ClientHttpResponse> {
        on { headers } doReturn HttpHeaders().apply { contentLength = 100L }
    }

    private val packetService = mock<PacketService> {
        on { getPackets(PageablePayload(0, 10), "", "") } doReturn mockPageablePackets
        on {
            getFileByPath(
                anyString(),
                anyString(),
                any<OutputStream>(),
                any<(ClientHttpResponse) -> Unit>()
            )
        } doAnswer { invocationOnMock ->
            val callback = invocationOnMock.getArgument<(ClientHttpResponse) -> Unit>(3)
            callback(mockClientHttpResponse)
            val outputStream = invocationOnMock.getArgument<OutputStream>(2)
            outputStream.write("mocked output content".toByteArray())
        }
        on { getPacketsByName(anyString()) } doReturn packets
        on { validateFilesExistForPacket(anyString(), anyList()) } doReturn packetMetadata[0].files

        packetMetadata.forEach {
            on { getMetadataBy(it.id) } doReturn it
        }
    }

    private val tokenId = UUID.randomUUID()
    private val oneTimeTokenService = mock<OneTimeTokenService> {
        on { createToken(anyString(), anyList()) } doReturn OneTimeToken(
            tokenId,
            packets.first(),
            listOf("mocked_token_file.txt"),
            Instant.now()
        )
        on { validateToken(any<UUID>(), anyString(), anyList()) } doReturn true
    }

    private val sut = PacketController(packetService, oneTimeTokenService)

    @Test
    fun `get pageable packets`()
    {
        val result = sut.pageableIndex(0, 10, "", "")
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body, mockPageablePackets.map { it.toDto() })
        assertEquals(1, mockPageablePackets.totalPages)
        assertEquals(2, mockPageablePackets.totalElements)
    }

    @Test
    fun `get packet metadata by id`()
    {
        val result = sut.findPacketMetadata(packetId)
        val responseBody = result.body
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(responseBody, packetMetadata[0])
    }

    @Test
    fun `generate token for downloading file`()
    {
        val result = sut.generateTokenForDownloadingFile(packetId, listOf("any_file.txt", "another_file.txt"))
        verify(packetService).validateFilesExistForPacket(packetId, listOf("any_file.txt", "another_file.txt"))
        verify(oneTimeTokenService).createToken(packetId, listOf("any_file.txt", "another_file.txt"))
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.body?.id, tokenId)
    }

    @Test
    fun `stream a single file after verifying validity of token`()
    {
        val response = MockHttpServletResponse()

        sut.streamFiles(
            id = packetId,
            paths = listOf("path/test.html"),
            token = tokenId,
            filename = "test-filename.html",
            inline = false,
            response = response,
        )

        verify(oneTimeTokenService).validateToken(tokenId, packetId, listOf("path/test.html"))

        val packetArgumentCaptor = argumentCaptor<String>()
        val pathArgumentCaptor = argumentCaptor<String>()
        verify(packetService).getFileByPath(packetArgumentCaptor.capture(), pathArgumentCaptor.capture(), any(), any())
        assertEquals(packetId, packetArgumentCaptor.firstValue)
        assertEquals("path/test.html", pathArgumentCaptor.firstValue)

        assertEquals(response.contentAsString, "mocked output content")

        assertEquals(response.status, HttpStatus.OK.value())
        assertEquals(response.contentType, "text/html")
        assertEquals(response.getHeader("Content-Disposition"), "attachment; filename=\"test-filename.html\"")
        assertEquals(response.getHeader("Content-Length"), "100")
    }

    @Test
    fun `stream a single file, with inline disposition, after verifying validity of token`()
    {
        val response = MockHttpServletResponse()

        sut.streamFiles(
            id = packetId,
            paths = listOf("path/test.html"),
            token = tokenId,
            filename = "test-filename.html",
            inline = true,
            response = response,
        )

        verify(oneTimeTokenService).validateToken(tokenId, packetId, listOf("path/test.html"))

        val packetArgumentCaptor = argumentCaptor<String>()
        val pathArgumentCaptor = argumentCaptor<String>()
        verify(packetService).getFileByPath(packetArgumentCaptor.capture(), pathArgumentCaptor.capture(), any(), any())
        assertEquals(packetId, packetArgumentCaptor.firstValue)
        assertEquals("path/test.html", pathArgumentCaptor.firstValue)

        assertEquals(response.contentAsString, "mocked output content")

        assertEquals(response.status, HttpStatus.OK.value())
        assertEquals(response.contentType, "text/html")
        assertEquals(response.getHeader("Content-Disposition"), "inline; filename=\"test-filename.html\"")
        assertEquals(response.getHeader("Content-Length"), "100")
    }

    @Test
    fun `stream multiple files as a zip, with a valid token`() {
        val response = MockHttpServletResponse()

        sut.streamFiles(packetId, listOf("file1.txt", "file2.txt"), tokenId, "my_archive.zip", false, response)

        verify(oneTimeTokenService).validateToken(tokenId, packetId, listOf("file1.txt", "file2.txt"))
        verify(packetService).streamZip(listOf("file1.txt", "file2.txt"), packetId, response.outputStream)

        assertEquals("application/zip", response.contentType)
        assertEquals("attachment; filename=\"my_archive.zip\"", response.getHeader("Content-Disposition"))
        assertEquals(HttpStatus.OK.value(), response.status)
    }

    @Test
    fun `refuse to stream zip as inline`() {
        val response = MockHttpServletResponse()

        val error = assertThrows<PackitException> {
            sut.streamFiles(packetId, listOf("file1.txt", "file2.txt"), tokenId, "my_archive.zip", true, response)
        }
        assertEquals("inlineDownloadNotSupported", error.key)
    }
}
