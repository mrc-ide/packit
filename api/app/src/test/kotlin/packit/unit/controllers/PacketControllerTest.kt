package packit.unit.controllers

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.*
import org.mockito.kotlin.any
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.data.domain.PageImpl
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletResponse
import packit.controllers.PacketController
import packit.exceptions.PackitException
import packit.model.*
import packit.service.PacketService
import java.io.OutputStream
import java.time.Instant
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
    private val testHeaders = HttpHeaders().apply { contentLength = 100L }
    private val packetService = mock<PacketService> {
        on { getPackets(PageablePayload(0, 10), "", "") } doReturn mockPageablePackets
        on {
            getFileByHash(
            anyString(),
            any<OutputStream>(),
            any<(HttpHeaders) -> Unit>()
        )
        } doAnswer { invocationOnMock ->
            val callback = invocationOnMock.getArgument<(HttpHeaders) -> Unit>(2)
            callback(testHeaders)
            val outputStream = invocationOnMock.getArgument<OutputStream>(1)
            outputStream.write("mocked output content".toByteArray())
        }
        on { getPacketsByName(anyString()) } doReturn packets

        packetMetadata.forEach {
            on { getMetadataBy(it.id) } doReturn it
        }
    }

    private val sut = PacketController(packetService)

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
    fun `get packet file by id`()
    {
        val response = MockHttpServletResponse()

        sut.streamFile(
            id = packetId,
            hash = "sha256:exampleHash",
            false,
            "test.html",
            response = response
        )
        assertEquals(response.contentAsString, "mocked output content")

        assertEquals(response.status, HttpStatus.OK.value())
        assertEquals(response.contentType, "text/html")
        assertEquals(response.getHeader("Content-Disposition"), "attachment; filename=\"test.html\"")
        assertEquals(response.getHeader("Content-Length"), "100")
    }

    @Test
    fun `get packet file by id, with inline disposition`()
    {
        val response = MockHttpServletResponse()

        sut.streamFile(
            id = packetId,
            hash = "sha256:exampleHash",
            true,
            "test.html",
            response = response
        )
        assertEquals(response.contentAsString, "mocked output content")

        assertEquals(response.status, HttpStatus.OK.value())
        assertEquals(response.contentType, "text/html")
        assertEquals(response.getHeader("Content-Disposition"), "inline; filename=\"test.html\"")
        assertEquals(response.getHeader("Content-Length"), "100")
    }

    @Test
    fun `cannot get file from different packet`()
    {
        val response = MockHttpServletResponse()

        val error = assertThrows<PackitException> {
            sut.streamFile(
                id = "20170819-164847-7574883b",
                hash = "sha256:exampleHash",
                false,
                "test.html",
                response = response
            )
        }
        assertEquals("doesNotExist", error.key)
    }

    @Test
    fun `streamZip should set correct response headers and content type, and call PacketService`() {
        val response = MockHttpServletResponse()

        val paths = listOf("file1.txt", "file2.txt")
        sut.streamZip(packetId, paths, response)

        verify(packetService).streamZip(listOf("file1.txt", "file2.txt"), packetId, response.outputStream)

        assertEquals("application/zip", response.contentType)
        assertEquals("attachment; filename=\"$packetId.zip\"", response.getHeader("Content-Disposition"))
        assertEquals(HttpStatus.OK.value(), response.status)
    }
}
