package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.convertValue
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.web.client.exchange
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Role
import packit.model.RolePermission
import packit.model.dto.*
import packit.repository.PacketGroupRepository
import packit.repository.PacketRepository
import packit.repository.PermissionRepository
import packit.repository.RoleRepository
import packit.service.PacketService
import kotlin.math.ceil
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class PacketGroupControllerTest(
    @Autowired val packetService: PacketService,
    @Autowired val packetRepository: PacketRepository,
    @Autowired val packetGroupRepository: PacketGroupRepository,
    @Autowired val roleRepository: RoleRepository,
    @Autowired val permissionsRepository: PermissionRepository
) : IntegrationTest() {
    companion object {
        const val idOfComputedResourcePacket = "20240729-154635-88c5c1eb"
    }

    @BeforeAll
    fun setupData() {
        packetService.importPackets()
    }

    @AfterAll
    fun cleanup() {
        packetRepository.deleteAll()
        packetGroupRepository.deleteAll()
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `getPacketGroups returns empty page if no permissions match`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)

        val resultPage = jacksonObjectMapper().readTree(result.body)
        assertEquals(0, resultPage.get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `return correct page information for get pageable packet groups `() {
        val expectedTotalSize = packetGroupRepository.count()

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups?pageNumber=0&pageSize=3",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)

        val resultPage = jacksonObjectMapper().readTree(result.body)
        assertThat(resultPage.get("totalElements").intValue()).isEqualTo(expectedTotalSize)
        assertThat(resultPage.get("totalPages").intValue()).isEqualTo(ceil(expectedTotalSize / 3.0).toInt())
        assertThat(resultPage.get("number").intValue()).isEqualTo(0)
        assertThat(resultPage.get("size").intValue()).isEqualTo(3)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `getPacketGroups can get second page with correct information`() {
        val expectedTotalSize = packetGroupRepository.count()

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups?pageNumber=1&pageSize=3",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)

        val resultPage = jacksonObjectMapper().readTree(result.body)
        assertThat(resultPage.get("totalElements").intValue()).isEqualTo(expectedTotalSize)
        assertThat(resultPage.get("totalPages").intValue()).isEqualTo(ceil(expectedTotalSize / 3.0).toInt())
        assertThat(resultPage.get("number").intValue()).isEqualTo(1)
        assertThat(resultPage.get("size").intValue()).isEqualTo(3)
    }

    @Test
    @WithAuthenticatedUser(
        authorities = [
            "packet.read:packetGroup:artefact-types",
            "packet.read:packet:computed-resource:$idOfComputedResourcePacket"
        ]
    )
    fun `getPacketGroups returns of packet groups user can see`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        val body = jacksonObjectMapper().readTree(result.body)
        val contents: List<PacketGroupDto> = jacksonObjectMapper().convertValue(body.get("content"))
        assertThat(contents).extracting("name").containsExactlyInAnyOrder("artefact-types", "computed-resource")
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `getPacketGroups with filtered name`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups?filterName=test",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)

        val body = jacksonObjectMapper().readTree(result.body!!)
        val contents: List<PacketGroupDto> = jacksonObjectMapper().convertValue(body.get("content"))
        assertThat(contents).extracting("name").containsExactlyInAnyOrder("test1", "test2", "test3")
    }

    @Test
    fun `getPackets returns error if not authenticated`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups/artefact-types/packets",
            HttpMethod.GET
        )
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `getPackets returns unauthorized if cant view packet`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups/artefact-types/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packet:computed-resource:$idOfComputedResourcePacket"])
    fun `getPackets returns list of packets user can see`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroups/computed-resource/packets",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertSuccess(result)

        val packets: List<PacketDto> = jacksonObjectMapper().readValue(result.body!!)
        assertThat(packets).extracting("id").containsExactly(idOfComputedResourcePacket)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `test can get packet group summary if authenticated`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroupSummaries?pageNumber=0&pageSize=5&filterName=hell",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        assertSuccess(result)
    }

    @Test
    fun `test can not get packet group summary if not authenticated`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroupSummaries?pageNumber=0&pageSize=5&filterName=hell",
            HttpMethod.GET
        )
        assertUnauthorized(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:random-name"])
    fun `getPacketGroupSummaries returns empty page if no permissions match`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroupSummaries",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )

        assertEquals(0, jacksonObjectMapper().readTree(result.body).get("totalElements").asInt())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read:packetGroup:artefact-types", "packet.read:packetGroup:depends"])
    fun `getPacketGroupSummaries returns list of packet groups user can see`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/packetGroupSummaries",
            HttpMethod.GET,
            getTokenizedHttpEntity()
        )
        val body = jacksonObjectMapper().readTree(result.body!!)
        val contents: List<PacketGroupSummary> = jacksonObjectMapper().convertValue(body.get("content"))

        assertThat(contents).extracting("name").containsExactlyInAnyOrder("artefact-types", "depends")
    }

    @Nested
    @TestInstance(TestInstance.Lifecycle.PER_CLASS)
    inner class PacketGroupControllerRolesTests {
        val roleNamesToStartWithout = setOf("testRole1", "testRole2")
        val roleNamesToBeginWith = setOf("testRole3", "testRole4")
        val packetGroupId = "test1"

        @BeforeEach
        fun setupRoles() {
            val packetGroup = packetGroupRepository.findByName(packetGroupId)!!

            roleRepository.saveAll(roleNamesToStartWithout.map { Role(name = it) })
            val rolesToRemove = roleRepository.saveAll(
                roleNamesToBeginWith.map { Role(name = it) }
            ).onEach {
                it.rolePermissions = mutableListOf(
                    RolePermission(
                        role = it,
                        permission = permissionsRepository.findByName("packet.read")!!,
                        packetGroup = packetGroup
                    )
                )
            }
            roleRepository.saveAll(rolesToRemove)
        }

        @Test
        @WithAuthenticatedUser(authorities = ["packet.manage:packet:wrong-name:wrong-id"])
        fun `user without permission cannot update read permission on roles`() {
            val updatePacketReadRoles = jacksonObjectMapper().writeValueAsString(
                UpdateReadRoles(
                    roleNamesToAdd = setOf(),
                    roleNamesToRemove = setOf()
                )
            )
            val result = restTemplate.exchange(
                "/packetGroups/test1/read-permission",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updatePacketReadRoles),
                String::class.java
            )

            assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
        }

        @Test
        @WithAuthenticatedUser(authorities = ["packet.manage"])
        fun `user with packet manage can update read permission on roles`() {
            val packetGroup = packetGroupRepository.findByName(packetGroupId)!!

            val updatePacketReadRoles = jacksonObjectMapper().writeValueAsString(
                UpdateReadRoles(
                    roleNamesToAdd = roleNamesToStartWithout,
                    roleNamesToRemove = roleNamesToBeginWith
                )
            )

            val result = restTemplate.exchange(
                "/packetGroups/${packetGroup.name}/read-permission",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updatePacketReadRoles),
                String::class.java
            )

            assertEquals(result.statusCode, HttpStatus.NO_CONTENT)
            val addedRoles = roleRepository.findByNameIn(roleNamesToStartWithout.toList())
            val removedRoles = roleRepository.findByNameIn(roleNamesToBeginWith.toList())
            removedRoles.forEach {
                assertEquals(
                    it.rolePermissions.size,
                    0
                )
            }
            addedRoles.forEach {
                assertEquals(
                    it.rolePermissions.first().packetGroup?.id,
                    packetGroup.id
                )
            }
        }

        @Test
        @WithAuthenticatedUser(
            authorities = ["packet.manage:packetGroup:test1"]
        )
        fun `can get roles and users for read permissions for packet group`() {
            val packetGroupName = "test1"
            val adminRole = roleRepository.findByName("ADMIN")
            val result: ResponseEntity<String> = restTemplate.exchange(
                "/packetGroups/$packetGroupName/read-permission",
                HttpMethod.GET,
                getTokenizedHttpEntity()
            )

            assertSuccess(result)

            val body = jacksonObjectMapper().readValue(
                result.body,
                object : TypeReference<RolesAndUsersForReadUpdate>() {}
            )

//            // If an 'ADMIN' role exists (created prior to running the tests), expect it in the can-read roles.
            assertThat(body?.canRead?.roles?.map { it.name }).containsAll(
                listOfNotNull(adminRole?.name) + roleNamesToBeginWith
            )
            assertThat(body?.withRead?.roles?.map { it.name }).containsAll(
                roleNamesToBeginWith
            )
            assertThat(body?.cannotRead?.roles?.map { it.name }).containsAll(
                roleNamesToStartWithout
            )
        }

        @Test
        @WithAuthenticatedUser(authorities = ["packet.manage:packetGroup:wrong-name"])
        fun `getting roles and users for update returns 401 if no packet manage`() {
            val packetGroupName = "test1"
            val result: ResponseEntity<String> = restTemplate.exchange(
                "/packetGroups/$packetGroupName/read-permission",
                HttpMethod.GET
            )

            assertUnauthorized(result)
        }
    }
}
