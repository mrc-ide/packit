package packit.unit.service

import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.*
import org.springframework.http.HttpHeaders
import packit.exceptions.PackitException
import packit.model.*
import packit.repository.PacketRepository
import packit.service.BasePacketService
import packit.service.OutpackServerClient
import java.time.Instant
import kotlin.test.assertEquals

class PacketServiceTest
{
    private val now = Instant.now().epochSecond
    private val newPackets = listOf(
            Packet(
                    "20190203-120000-1234dada", "test", "test",
                    mapOf("alpha" to 1), false, now
            ),
            Packet(
                    "20190403-120000-1234dfdf", "test2", "test2",
                    mapOf(), false, now
            )
    )

    private val oldPackets = listOf(
            Packet(
                    "20180203-120000-abdefg56", "test", "test name",
                    mapOf("name" to "value"), false, now - 1
            ),
            Packet(
                    "20180403-120000-a5bde567", "test2", "test2 name",
                    mapOf("beta" to 1), true, now - 2
            )
    )

    private val metadata = listOf(
            OutpackMetadata(
                    "20190203-120000-1234dada", "test",
                    parameters = mapOf("alpha" to 1),
                    custom = mapOf("orderly" to true)
            ),
            OutpackMetadata(
                    "20190403-120000-1234dfdf", "test2",
                    null, null
            )
    )

    private val packetMetadata = Metadata(
        "3",
        "test",
        mapOf("name" to "value"),
        emptyList(),
        GitMetadata("git", "sha", emptyList()),
        TimeMetadata(Instant.now().epochSecond.toDouble(), Instant.now().epochSecond.toDouble()),
        emptyMap(),
    )

    private val responseByte = "htmlContent".toByteArray() to HttpHeaders.EMPTY

    private val packetRepository = mock<PacketRepository> {
        on { findAll() } doReturn oldPackets
        on { findAllIds() } doReturn oldPackets.map { it.id }
        on { findTopByOrderByTimeDesc() } doReturn oldPackets.first()
    }

    private val outpackServerClient = mock<OutpackServerClient> {
        on { getMetadata(now - 1) } doReturn metadata
        on { getMetadataById(anyString()) } doReturn packetMetadata
        on {getFileByHash(anyString())} doReturn responseByte
    }

    @Test
    fun `gets packets`()
    {
        val sut = BasePacketService(packetRepository, mock())

        val result = sut.getPackets()

        assertEquals(result, oldPackets)
    }

    @Test
    fun `throws exception if packet metadata does not exist`()
    {
        val sut = BasePacketService(packetRepository, mock())

        assertThatThrownBy { sut.getMetadataBy("123") }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key doesNotExist")
    }

    @Test
    fun `gets checksum of packet ids`()
    {
        val sut = BasePacketService(packetRepository, mock())

        val result = sut.getChecksum()

        // outpack:::hash_data(paste(c("20180203-120000-abdefg56",
        // "20180403-120000-a5bde567"), collapse = ""), "sha256)
        val expected =
                "sha256:723cf37faa446c3d4cf11659b5e4eb7a8ad93d847c344846962a9ddefa37519e"
        assertEquals(result, expected)
    }

    @Test
    fun `imports packets`()
    {
        val sut = BasePacketService(packetRepository, outpackServerClient)
        sut.importPackets()

        verify(packetRepository).saveAll(newPackets)
    }

    @Test
    fun `can get packet metadata`()
    {
        val sut = BasePacketService(packetRepository, outpackServerClient)
        val result = sut.getMetadataBy("123")

        assertEquals(result, packetMetadata)
    }

    @Test
    fun `can get packet file`()
    {
        val sut = BasePacketService(packetRepository, outpackServerClient)
        val result = sut.getFileBy("sha123")

        assertEquals(result.first.isReadable, true)
    }

    @Test
    fun `throws exception if client could not get file from outpack`()
    {
        val sut = BasePacketService(packetRepository, mock())

        assertThatThrownBy { sut.getFileBy("123") }
            .isInstanceOf(PackitException::class.java)
            .hasMessageContaining("PackitException with key doesNotExist")
    }
}
