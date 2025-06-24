package packit.unit.service

import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.client.ClientHttpResponse
import packit.exceptions.PackitException
import packit.model.*
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import packit.repository.RunInfoRepository
import packit.service.BasePacketService
import packit.service.OutpackServerClient
import packit.unit.packetToOutpackMetadata
import java.io.ByteArrayOutputStream
import java.io.OutputStream
import java.time.Instant
import java.util.*
import java.util.zip.ZipInputStream
import kotlin.test.assertEquals

class PacketServiceTest {
    private val now = Instant.now().epochSecond.toDouble()
    private val testPacketLatestId = "20190203-120000-1234dada"
    private val test2PacketLatestId = "20190403-120000-1234dfdf"

    private val newPackets =
        listOf(
            Packet(
                "20240101-090000-4321gaga",
                "test",
                "",
                mapOf("alpha" to 1),
                now,
                now,
                now
            ),
            Packet(
                testPacketLatestId,
                "test",
                "test name (latest display name)",
                mapOf("beta" to 1),
                now,
                now + 100,
                now
            ),
            Packet(
                test2PacketLatestId,
                "test2",
                "Test 2 Display Name",
                mapOf(),
                now,
                now,
                now
            )
        )

    private val oldPackets =
        listOf(
            Packet(
                "20180203-120000-abdefg56",
                "test",
                "test name (old display name)",
                mapOf("name" to "value"),
                now - 50,
                (now - 100),
                now,
            ),
            Packet(
                "20180403-120000-a5bde567",
                "test2",
                "",
                mapOf("beta" to 1),
                now - 60,
                (now - 200),
                now,
            )
        )

    private val packetMetadata =
        PacketMetadata(
            "3",
            "test",
            mapOf("name" to "value"),
            files = listOf(
                FileMetadata("file1.txt", 10, "sha256:hash1"),
                FileMetadata("file2.txt", 10, "sha256:hash2")
            ),
            GitMetadata("git", "sha", emptyList()),
            TimeMetadata(
                Instant.now().epochSecond.toDouble(),
                Instant.now().epochSecond.toDouble()
            ),
            mapOf(
                "orderly" to mapOf(
                    "description" to mapOf(
                        "display" to "Testable Display Name",
                        "long" to "A testable description"
                    )
                )
            ),
            emptyList(),
        )

    private val packetRepository =
        mock<PacketRepository> {
            on { findAll() } doReturn oldPackets
            on { findAllIds() } doReturn oldPackets.map { it.id }
            on { findTopByOrderByImportTimeDesc() } doReturn oldPackets.first()
            on { findByName(anyString(), any()) } doReturn oldPackets
            on { findAllByNameContainingAndIdContaining(anyString(), anyString(), any<Sort>()) } doReturn oldPackets
        }

    private val packetGroups = listOf(PacketGroup("test"), PacketGroup("test2"))
    private val packetGroupRepository = mock<PacketGroupRepository> {
        on { findAll() } doReturn packetGroups
    }

    private val newPacketOutpackMetadata = newPackets.map { packetToOutpackMetadata(it) }
    private val outpackServerClient =
        mock<OutpackServerClient> {
            on { getMetadata(oldPackets[0].importTime) } doReturn newPacketOutpackMetadata
            on { getMetadataById(packetMetadata.id) } doReturn packetMetadata
            on {
                getFileByHash(
                    anyString(),
                    any<OutputStream>(),
                    any<(ClientHttpResponse) -> Unit>()
                )
            } doAnswer { invocationOnMock ->
                val outputStream = invocationOnMock.getArgument<OutputStream>(1)
                outputStream.write("mocked output content".toByteArray())
            }
        }

    @Test
    fun `gets packets by a list of ids`() {
        val packets = listOf(oldPackets[1], newPackets[0])
        val packetIds = packets.map { it.id }
        val mockPacketRepository = mock<PacketRepository> {
            on { findAllById(packetIds) } doReturn packets
        }
        val sut = BasePacketService(mockPacketRepository, packetGroupRepository, mock(), outpackServerClient)

        assertEquals(sut.getPackets(packetIds), packets)
        verify(mockPacketRepository).findAllById(packetIds)
    }

    @Test
    fun `gets packets`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), mock())

        val result = sut.getPackets()

        assertEquals(result, oldPackets)
    }

    @Test
    fun `getPackets calls repository with correct params and returns its result`() {
        val pageablePayload = PageablePayload(pageNumber = 0, pageSize = 10)
        val filterName = "para"
        val filterId = "123"
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(),  mock())

        val result = sut.getPackets(pageablePayload, filterName, filterId)

        assertEquals(oldPackets, result.content)
        verify(packetRepository).findAllByNameContainingAndIdContaining(
            filterName,
            filterId,
            Sort.by("startTime").descending()
        )
    }

    @Test
    fun `gets packets by name`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), mock())

        val result = sut.getPacketsByName("pg1")

        assertEquals(result, oldPackets)
        verify(packetRepository)
            .findByName("pg1", Sort.by("startTime").descending())
    }

    @Test
    fun `getMetadataBy throws exception if packet metadata does not exist`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), mock())

        assertThatThrownBy { sut.getMetadataBy("123") }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key doesNotExist")
    }

    @Test
    fun `gets checksum of packet ids`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), mock())

        val result = sut.getChecksum()

        val expected = "sha256:723cf37faa446c3d4cf11659b5e4eb7a8ad93d847c344846962a9ddefa37519e"
        assertEquals(result, expected)
    }

    @Test
    fun `imports packets and saves`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)
        val argumentCaptor = argumentCaptor<List<Packet>>()

        sut.importPackets()

        verify(packetRepository).saveAll(argumentCaptor.capture())
        val packets = argumentCaptor.allValues.flatten()
        assertEquals(packets.size, 3)
    }

    @Test
    fun `importPackets saves unique packet groups`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)
        val argumentCaptor = argumentCaptor<List<PacketGroup>>()

        sut.importPackets()

        verify(packetGroupRepository).saveAll(argumentCaptor.capture())
        val packetGroups = argumentCaptor.allValues.flatten()
        assertEquals(packetGroups.size, 2)

        assertEquals(packetGroups.first().name, "test")
        assertEquals(packetGroups.last().name, "test2")
    }

    @Test
    fun `resyncPackets saves new packets and deletes nonexistent packets`() {
        // This time, let's say we already know about the first "new" packet id as well - that should be retained,
        // while the other old packet ids should be deleted
        val oldPacketIds = oldPackets.map { it.id }.toMutableList()
        oldPacketIds.add(newPackets[0].id)

        val resyncPacketRepository = mock<PacketRepository> {
                on { findAllIds() } doReturn oldPacketIds
            }
        val resyncOutpackServerClient = mock<OutpackServerClient> {
            on { getMetadata(null) } doReturn newPacketOutpackMetadata
        }
        val runInfoRepository = mock<RunInfoRepository> {}

        val argumentCaptor = argumentCaptor<List<Packet>>()

        // Should add packets from outpack even when they were run after packets we already know about
        val sut = BasePacketService(resyncPacketRepository, packetGroupRepository, runInfoRepository, resyncOutpackServerClient)
        sut.resyncPackets()

        // should delete: all in "oldPackets"
        verify(runInfoRepository).deleteByPacketId(oldPacketIds[0])
        verify(runInfoRepository).deleteByPacketId(oldPacketIds[1])
        verify(resyncPacketRepository).deleteById(oldPacketIds[0])
        verify(resyncPacketRepository).deleteById(oldPacketIds[1])

        // should add: new packets [1] and [2]
        verify(resyncPacketRepository).saveAll(argumentCaptor.capture())
        val savedPackets = argumentCaptor.allValues.flatten()
        assertEquals(2, savedPackets.size,)
        assertEquals(newPackets[1].id, savedPackets[0].id)
        assertEquals(newPackets[2].id, savedPackets[1].id)
    }

    @Test
    fun `can get packet metadata`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)
        val result = sut.getMetadataBy(packetMetadata.id)

        assertEquals(result, packetMetadata)
    }

    @Test
    fun `getPacket returns packet when packet exists with given id`() {
        whenever(packetRepository.findById(oldPackets[0].id)).thenReturn(Optional.of(oldPackets[0]))
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(),  mock())

        val result = sut.getPacket(oldPackets[0].id)

        assertEquals(oldPackets[0], result)
    }

    @Test
    fun `getPacket throws PackitException when no packet exists with given id`() {
        val packetId = "nonExistingId"
        whenever(packetRepository.findById(packetId)).thenReturn(Optional.empty())
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), mock())

        assertThrows<PackitException> {
            sut.getPacket(packetId)
        }.apply {
            assertEquals("packetNotFound", key)
            assertEquals(HttpStatus.NOT_FOUND, httpStatus)
        }
    }

    @Test
    fun `validateFilesExistsForPacket throws when any path is not found on the packet metadata`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)

        val error = assertThrows<PackitException> {
            sut.validateFilesExistForPacket(packetMetadata.id, listOf("file1.txt", "no-such-file.txt"))
        }
        assertEquals("PackitException with key notAllFilesFound", error.message)
    }

    @Test
    fun `validateFilesExistsForPacket throws when no paths are supplied`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)

        val error = assertThrows<PackitException> {
            sut.validateFilesExistForPacket(packetMetadata.id, listOf())
        }
        assertEquals("PackitException with key noFilesProvided", error.message)
    }

    @Test
    fun `validateFilesExistsForPacket returns the list of all files belonging to the packet`() {
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)

        val result = sut.validateFilesExistForPacket(packetMetadata.id, listOf("file1.txt"))
        assertEquals(packetMetadata.files, result)
    }

    @Test
    fun `getFileByPath should forward the request to outpack_server client`() {
        val outputStream = ByteArrayOutputStream()
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)
        val mockLambda = mock<(ClientHttpResponse) -> Unit>()
        sut.getFileByPath(packetMetadata.id, "file1.txt", outputStream, mockLambda)
        verify(outpackServerClient).getFileByHash("sha256:hash1", outputStream, mockLambda)
    }

    @Test
    fun `getFileByPath should throw PackitException if file not found`() {
        val outputStream = ByteArrayOutputStream()
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)

        assertThrows<PackitException> {
            sut.getFileByPath(packetMetadata.id, "no-such-file.txt", outputStream) {}
        }
    }

    @Test
    fun `streamZip should write files to zip output stream`() {
        val outputStream = ByteArrayOutputStream()
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)
        sut.streamZip(listOf("file1.txt", "file2.txt"), packetMetadata.id, outputStream)

        val zipInputStream = ZipInputStream(outputStream.toByteArray().inputStream())

        val entryNames = mutableListOf<String>()
        val entryContents = mutableListOf<String>()
        var entry = zipInputStream.nextEntry
        while (entry != null) {
            entryNames.add(entry.name)
            entryContents.add(zipInputStream.readBytes().toString(Charsets.UTF_8))
            entry = zipInputStream.nextEntry
        }
        assertEquals(listOf("file1.txt", "file2.txt"), entryNames)
        assertEquals(listOf("mocked output content", "mocked output content"), entryContents)
    }

    @Test
    fun `streamZip should throw PackitException if not all files are found`() {
        val outputStream = ByteArrayOutputStream()
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)

        assertThrows<PackitException> {
            sut.streamZip(listOf("file1.txt", "file2.txt", "no-such-file.txt"), packetMetadata.id, outputStream)
        }
    }

    @Test
    fun `streamZip should throw PackitException if no paths supplied`() {
        val outputStream = ByteArrayOutputStream()
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)

        assertThrows<PackitException> {
            sut.streamZip(listOf(), packetMetadata.id, outputStream)
        }
    }

    @Test
    fun `streamZip should throw PackitException if there is an error creating the zip`() {
        val outputStream = ByteArrayOutputStream()
        val sut = BasePacketService(packetRepository, packetGroupRepository, mock(), outpackServerClient)
        whenever(
            outpackServerClient.getFileByHash(anyString(), any<OutputStream>(), any<(ClientHttpResponse) -> Unit>())
        ).thenThrow(RuntimeException("error"))

        assertThrows<PackitException> {
            sut.streamZip(listOf("file1.txt", "file2.txt"), packetMetadata.id, outputStream)
        }
    }
}
