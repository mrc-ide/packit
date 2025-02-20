package packit.integration.controllers
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.*
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import packit.service.PacketService
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PacketControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var packetService: PacketService

    @Autowired
    private lateinit var packetRepository: PacketRepository

    @Autowired
    private lateinit var packetGroupRepository: PacketGroupRepository

    companion object {
        const val idOfArtefactTypesPacket = "20240729-154633-10abe7d1"
        const val idOfComputedResourcePacket = "20240729-154635-88c5c1eb"
        const val idOfDownloadTypesPacket3 = "20250122-142620-c741b061"
        const val hashOfReport = "sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1"
        val filePathsAndSizesForDownloadTypesPacket = mapOf(
            "a_renamed_common_resource.csv" to 11L,
            "artefact1/artefact_data.csv" to 51L,
            "artefact1/excel_file.xlsx" to 4715L,
            "artefact1/internal_presentation.pdf" to 14097L,
            "artefact1/other_extensions.txt" to 15L,
            "data.csv" to 51L,
            "input_files/plot.png" to 7344L,
            "orderly.R" to 884L,
            "presentation.html" to 40L
        )
    }

    @BeforeAll
    fun setupData()
    {
        packetService.importPackets()
    }

    @AfterAll
    fun cleanup()
    {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get pageable packets`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets?pageNumber=0&pageSize=5",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    fun `does not get pageable packets when not logged in`()
    {
        val result = restTemplate.getForEntity("/packets?pageNumber=3&pageSize=5", String::class.java)
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get non pageable packets`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `get packet metadata by packet id`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:artefact-types:$idOfArtefactTypesPacket"])
    fun `findPacketMetadata returns metadata if user has correct specific permission`()
    {

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:name:wrong-id"])
    fun `findPacketMetadata returns 401 if incorrect specific permission`()
    {

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:artefact-types:$idOfArtefactTypesPacket"])
    fun `streamFile returns file if user has correct specific permission`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket/file?hash=$hashOfReport&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertHtmlFileSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:computed-resource:$idOfComputedResourcePacket"])
    fun `streamFile returns 404 if the packet does not contain the file hash`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/file/$idOfComputedResourcePacket?hash=$hashOfReport&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:wrong-id"])
    fun `streamFile returns 401 if incorrect specific permission`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket/file?hash=$hashOfReport&filename=report.html",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `pageableIndex returns empty page if no permissions match`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(0, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:artefact-types"])
    fun `pageableIndex returns packets user can see`()
    {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        val body = jacksonObjectMapper().readTree(result.body)

        assertThat(body.get("totalElements").intValue()).isGreaterThan(0)
        assertThat(body.get("content")).allSatisfy {
            assertThat(it.get("name").textValue()).isEqualTo("artefact-types")
        }
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:download-types"])
    fun `streamZip streams a zip file`()
    {
        val paths = filePathsAndSizesForDownloadTypesPacket.keys
        val result: ResponseEntity<ByteArray> = restTemplate.exchange(
            "/packets/{id}/zip?paths={paths}",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            mapOf("id" to idOfDownloadTypesPacket3, "paths" to paths.joinToString(","))
        )
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.headers["Transfer-Encoding"]?.firstOrNull(), "chunked") // Header denoting streaming
        assertEquals(result.headers.contentType.toString(), "application/zip")

        // Read the stream into a zip file
        val zipInputStream = ZipInputStream(result.body!!.inputStream())
        val entries = mutableListOf<String>()
        val uncompressedSizes = mutableListOf<Long>()
        var entry: ZipEntry? = zipInputStream.nextEntry!!
        while (entry != null) {
            entries.add(entry.name)
            val nextEntry = zipInputStream.nextEntry
            // entry.size is not available until nextEntry has been called: see
            // https://stackoverflow.com/questions/25602406/zipentry-unknown-size-although-set
            uncompressedSizes.add(entry.size)
            entry = nextEntry
        }
        zipInputStream.close()

        assertThat(entries).containsExactlyInAnyOrderElementsOf(paths)
        val expectedSizes = filePathsAndSizesForDownloadTypesPacket.values
        assertThat(uncompressedSizes).containsExactlyInAnyOrderElementsOf(expectedSizes)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:download-types"])
    fun `streamZip 400s when passed an empty list of paths`()
    {
        val result: ResponseEntity<ByteArray> = restTemplate.exchange(
            "/packets/{id}/zip?paths={paths}",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            mapOf("id" to idOfDownloadTypesPacket3, "paths" to "")
        )
        assertBadRequest(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:download-types"])
    fun `streamZip 404s when passed any files not associated with the packet in question`()
    {
        val paths = filePathsAndSizesForDownloadTypesPacket.keys + "not_a_file.txt"

        val result: ResponseEntity<ByteArray> = restTemplate.exchange(
            "/packets/{id}/zip?paths={paths}",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            mapOf("id" to idOfDownloadTypesPacket3, "paths" to paths.joinToString(","))
        )
        assertNotFound(result)
    }
}
