package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.PacketControllerTestHelper
import packit.integration.WithAuthenticatedUser
import packit.model.OneTimeToken
import packit.model.Role
import packit.model.RolePermission
import packit.model.dto.RolesAndUsersForReadUpdate
import packit.model.dto.UpdateReadRoles
import packit.repository.*
import packit.service.PacketService
import java.time.Instant
import java.util.*
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class PacketControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var packetService: PacketService

    @Autowired
    private lateinit var packetRepository: PacketRepository

    @Autowired
    private lateinit var packetGroupRepository: PacketGroupRepository

    @Autowired
    private lateinit var oneTimeTokenRepository: OneTimeTokenRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    @Autowired
    private lateinit var permissionsRepository: PermissionRepository

    private lateinit var packetControllerTestHelper: PacketControllerTestHelper

    @BeforeAll
    fun setupData() {
        packetService.importPackets()
    }

    @BeforeEach
    fun setUpHelper() {
        packetControllerTestHelper = PacketControllerTestHelper(this)
    }

    @AfterAll
    fun cleanup() {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
    }

    companion object {
        const val idOfArtefactTypesPacket = "20240729-154633-10abe7d1"
        const val idOfDownloadTypesPacket3 = "20250122-142620-c741b061"
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

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get pageable packets`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets?pageNumber=0&pageSize=5",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    fun `does not get pageable packets when not logged in`() {
        val result = restTemplate.getForEntity("/packets?pageNumber=3&pageSize=5", String::class.java)
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `can get non pageable packets`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `get packet metadata by packet id`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:artefact-types:$idOfArtefactTypesPacket"])
    fun `findPacketMetadata returns metadata if user has correct specific permission`() {

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:name:wrong-id"])
    fun `findPacketMetadata returns 401 if incorrect specific permission`() {

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets/$idOfArtefactTypesPacket",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `pageableIndex returns empty page if no permissions match`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(0, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:artefact-types"])
    fun `pageableIndex returns packets user can see`() {
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
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:wrong-name"])
    fun `generateTokenForDownloadingFile returns 401 if no permissions match the packet`() {
        val originalTokenCount = oneTimeTokenRepository.count()

        val result: ResponseEntity<String> = packetControllerTestHelper.callGenerateTokenEndpoint(
            paths = filePathsAndSizesForDownloadTypesPacket.keys,
            packetId = idOfDownloadTypesPacket3
        )

        assertUnauthorized(result)
        assertThat(oneTimeTokenRepository.count()).isEqualTo(originalTokenCount)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:download-types"])
    fun `generateTokenForDownloadingFile returns 400 if any of the filepaths are not found on the packet`() {
        val originalTokenCount = oneTimeTokenRepository.count()

        val result: ResponseEntity<String> = packetControllerTestHelper.callGenerateTokenEndpoint(
            paths = filePathsAndSizesForDownloadTypesPacket.keys + "not_a_file.txt",
            packetId = idOfDownloadTypesPacket3
        )

        assertBadRequest(result)
        assertThat(oneTimeTokenRepository.count()).isEqualTo(originalTokenCount)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:download-types"])
    fun `generateTokenForDownloadingFile returns 400 if no filepaths are provided`() {
        val originalTokenCount = oneTimeTokenRepository.count()

        val result: ResponseEntity<String> = packetControllerTestHelper.callGenerateTokenEndpoint(
            paths = setOf(),
            packetId = idOfDownloadTypesPacket3
        )

        assertBadRequest(result)
        assertThat(oneTimeTokenRepository.count()).isEqualTo(originalTokenCount)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:download-types"])
    fun `generateTokenForDownloadingFile creates a token with correct attributes and returns its UUID`() {
        val now = Instant.now()
        val originalTokenCount = oneTimeTokenRepository.count()
        val paths = filePathsAndSizesForDownloadTypesPacket.keys

        val result: ResponseEntity<String> = packetControllerTestHelper.callGenerateTokenEndpoint(
            paths,
            idOfDownloadTypesPacket3
        )

        assertSuccess(result)
        val jsonNode = jacksonObjectMapper().readTree(result.body)
        val id = jsonNode.get("id").asText()
        assertThat(oneTimeTokenRepository.count()).isEqualTo(originalTokenCount + 1)
        val token = oneTimeTokenRepository.findById(UUID.fromString(id)).get()
        assertThat(token.packet.id).isEqualTo(idOfDownloadTypesPacket3)
        assertThat(token.filePaths).containsExactlyInAnyOrderElementsOf(paths)
        assertThat(token.expiresAt).isAfter(now)
        assertThat(token.expiresAt).isBefore(now.plusSeconds(99))
    }

    @Test
    fun `streamFile returns 401 'unauthorized' when no token query parameter is provided`() {
        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFileEndpoint(
            path = "a_renamed_common_resource.csv",
            packetId = idOfDownloadTypesPacket3,
            tokenId = "",
            filename = "filename-test.zip"
        )
        val body = jacksonObjectMapper().readTree(result.body)
        assertEquals(body.get("error").get("detail").asText(), "One-time token id is required")
        assertUnauthorized(result)
    }

    @Test
    fun `streamFile returns 401 'unauthorized' when passed a token id that does not exist`() {
        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFileEndpoint(
            path = "a_renamed_common_resource.csv",
            packetId = idOfDownloadTypesPacket3,
            tokenId = UUID.randomUUID().toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFile returns 401 'unauthorized' when the token's filepaths do not match the requested files`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf("a_renamed_common_resource.csv", "artefact1/artefact_data.csv"),
                expiresAt = Instant.now().plusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFileEndpoint(
            path = "a_renamed_common_resource.csv",
            packetId = idOfDownloadTypesPacket3,
            tokenId = token.id.toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFile returns 401 'unauthorized' when the token's packet does not match the requested packet`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf("a_renamed_common_resource.csv"),
                expiresAt = Instant.now().plusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFileEndpoint(
            path = "a_renamed_common_resource.csv",
            packetId = idOfArtefactTypesPacket,
            tokenId = token.id.toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFile returns 401 'unauthorized' when the token has expired`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf("a_renamed_common_resource.csv"),
                expiresAt = Instant.now().minusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFileEndpoint(
            path = "a_renamed_common_resource.csv",
            packetId = idOfDownloadTypesPacket3,
            tokenId = token.id.toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFile can stream a single file, uncompressed, and deletes the one-time token`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf("a_renamed_common_resource.csv"),
                expiresAt = Instant.now().plusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFileEndpoint(
            path = "a_renamed_common_resource.csv",
            packetId = idOfDownloadTypesPacket3,
            tokenId = token.id.toString(),
            filename = "filename-test.csv"
        )

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("attachment; filename=\"filename-test.csv\"", result.headers["Content-Disposition"]?.firstOrNull())
        assertEquals("text/csv", result.headers.contentType.toString())

        assertThat(result.body).isEqualToIgnoringNewLines("x,y\n1,2\n2,4")

        assertThat(oneTimeTokenRepository.findById(token.id).isEmpty).isTrue
    }

    @Test
    fun `streamFilesZipped returns 401 'unauthorized' when no token query parameter is provided`() {
        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFilesZippedEndpoint(
            paths = setOf("a_renamed_common_resource.csv"),
            packetId = idOfDownloadTypesPacket3,
            tokenId = "",
            filename = "filename-test.zip"
        )
        val body = jacksonObjectMapper().readTree(result.body)
        assertEquals(body.get("error").get("detail").asText(), "One-time token id is required")
        assertUnauthorized(result)
    }

    @Test
    fun `streamFilesZipped returns 401 'unauthorized' when passed a token id that does not exist`() {
        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFilesZippedEndpoint(
            paths = setOf("a_renamed_common_resource.csv"),
            packetId = idOfDownloadTypesPacket3,
            tokenId = UUID.randomUUID().toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFilesZipped returns 401 'unauthorized' when the token's filepaths do not match the requested files`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf("a_renamed_common_resource.csv"),
                expiresAt = Instant.now().plusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFilesZippedEndpoint(
            paths = setOf("a_renamed_common_resource.csv", "artefact1/artefact_data.csv"),
            packetId = idOfDownloadTypesPacket3,
            tokenId = token.id.toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFilesZipped returns 401 'unauthorized' when the token's packet does not match the requested packet`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf("a_renamed_common_resource.csv"),
                expiresAt = Instant.now().plusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFilesZippedEndpoint(
            paths = setOf("a_renamed_common_resource.csv"),
            packetId = idOfArtefactTypesPacket,
            tokenId = token.id.toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFilesZipped returns 401 'unauthorized' when the token has expired`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf("a_renamed_common_resource.csv", "artefact1/artefact_data.csv"),
                expiresAt = Instant.now().minusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFilesZippedEndpoint(
            paths = setOf("a_renamed_common_resource.csv", "artefact1/artefact_data.csv"),
            packetId = idOfDownloadTypesPacket3,
            tokenId = token.id.toString(),
            filename = "filename-test.zip"
        )
        assertUnauthorized(result)
    }

    @Test
    fun `streamFilesZipped streams a zip file, and deletes the one-time token`() {
        val paths = filePathsAndSizesForDownloadTypesPacket.keys
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = paths.toList(),
                expiresAt = Instant.now().plusSeconds(10)
            )
        )

        val result: ResponseEntity<ByteArray> = packetControllerTestHelper.callStreamFilesZippedEndpoint(
            paths = paths,
            packetId = idOfDownloadTypesPacket3,
            tokenId = token.id.toString(),
            filename = "filename-test.zip"
        )
        assertEquals(result.statusCode, HttpStatus.OK)
        assertEquals(result.headers["Transfer-Encoding"]?.firstOrNull(), "chunked") // Header denoting streaming
        assertEquals(result.headers.contentType.toString(), "application/zip")
        assertEquals("attachment; filename=\"filename-test.zip\"", result.headers["Content-Disposition"]?.firstOrNull())

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

        assertThat(oneTimeTokenRepository.findById(token.id).isEmpty).isTrue
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:download-types"])
    fun `streamFilesZipped 400s when passed an empty list of paths`() {
        val token = oneTimeTokenRepository.save(
            OneTimeToken(
                id = UUID.randomUUID(),
                packet = packetRepository.findById(idOfDownloadTypesPacket3).get(),
                filePaths = listOf(),
                expiresAt = Instant.now().plusSeconds(10)
            )
        )

        val result: ResponseEntity<String> = packetControllerTestHelper.callStreamFilesZippedEndpoint(
            paths = setOf(),
            packetId = idOfDownloadTypesPacket3,
            tokenId = token.id.toString(),
            filename = "filename-test.csv"
        )
        assertBadRequest(result)
    }

    @Nested
    @TestInstance(TestInstance.Lifecycle.PER_CLASS)
    inner class PacketControllerRolesTests {
        val roleNamesToStartWithout = setOf("testRole1", "testRole2")
        val roleNamesToBeginWith = setOf("testRole3", "testRole4")

        @BeforeEach
        fun setupRoles() {
            val artefactTypesPacket = packetRepository.findById(idOfArtefactTypesPacket).orElse(null)
            val packetReadPermission = permissionsRepository.findByName("packet.read")
            roleRepository.saveAll(roleNamesToStartWithout.map { Role(name = it) })
            val rolesToRemove = roleRepository.saveAll(
                roleNamesToBeginWith.map { Role(name = it) }
            ).onEach {
                it.rolePermissions = mutableListOf(
                    RolePermission(role = it, permission = packetReadPermission!!, packet = artefactTypesPacket!!)
                )
            }
            roleRepository.saveAll(rolesToRemove)
        }

        @Test
        @WithAuthenticatedUser(authorities = ["packet.manage:packet:test:123"])
        fun `user without permission cannot update read permission on roles`() {
            val updatePacketReadRoles = jacksonObjectMapper().writeValueAsString(
                UpdateReadRoles(
                    roleNamesToAdd = setOf(),
                    roleNamesToRemove = setOf()
                )
            )
            val result = restTemplate.exchange(
                "/packets/$idOfArtefactTypesPacket/read-permission",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updatePacketReadRoles),
                String::class.java
            )

            assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
        }

        @Test
        @WithAuthenticatedUser(authorities = ["packet.manage:packet:artefact-types:$idOfArtefactTypesPacket"])
        fun `user with packet manage can update read permission on roles`() {
            val updatePacketReadRoles = jacksonObjectMapper().writeValueAsString(
                UpdateReadRoles(
                    roleNamesToAdd = roleNamesToStartWithout,
                    roleNamesToRemove = roleNamesToBeginWith
                )
            )

            val result = restTemplate.exchange(
                "/packets/$idOfArtefactTypesPacket/read-permission",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updatePacketReadRoles),
                String::class.java
            )

            assertEquals(result.statusCode, HttpStatus.NO_CONTENT)
            roleNamesToBeginWith.forEach {
                val role = roleRepository.findByName(it)!!
                assertEquals(role.rolePermissions.size, 0)
            }
            roleNamesToStartWithout.forEach {
                val role = roleRepository.findByName(it)!!
                assertEquals(role.rolePermissions.first().packet?.id, idOfArtefactTypesPacket)
            }
        }

        @Test
        @WithAuthenticatedUser(authorities = ["packet.manage:packet:artefact-types:$idOfArtefactTypesPacket"])
        fun `can get roles and users for packet the user has manage permission for`() {
            val result = restTemplate.exchange(
                "/packets/$idOfArtefactTypesPacket/read-permission",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

            assertSuccess(result)

            val body = jacksonObjectMapper().readValue(
                result.body,
                object : TypeReference<RolesAndUsersForReadUpdate>() {}
            )

            // If an 'ADMIN' role exists (created prior to running the tests), expect it in the list of can-read roles.
            assertThat(body.canRead.roles.map { it.name }).containsExactlyInAnyOrderElementsOf(
                roleNamesToBeginWith + listOfNotNull(roleRepository.findByName("ADMIN")?.name)
            )
            assertThat(body.withRead.roles.map { it.name })
                .containsExactlyInAnyOrderElementsOf(roleNamesToBeginWith)
            assertThat(body.cannotRead.roles.map { it.name })
                .containsExactlyInAnyOrderElementsOf(roleNamesToStartWithout)
        }

        @Test
        @WithAuthenticatedUser(authorities = ["packet.manage:test:wrong-id"])
        fun `getting roles and users for update returns 401 if no packet manage`() {
            val result = restTemplate.exchange(
                "/packets/$idOfArtefactTypesPacket/read-permission",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

            assertUnauthorized(result)
        }
    }
}
