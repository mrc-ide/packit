package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.*
import packit.model.dto.*
import packit.repository.PermissionRepository
import packit.repository.RoleRepository
import packit.repository.UserRepository
import packit.service.RoleService
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class RoleControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    @Autowired
    private lateinit var permissionsRepository: PermissionRepository

    @Autowired
    private lateinit var roleService: RoleService

    private val testCreateRole = CreateRole(
        name = "testRole",
        permissionNames = listOf("packet.run", "packet.read")
    )
    private val createTestRoleBody = jacksonObjectMapper().writeValueAsString(
        testCreateRole
    )
    private val updateRolePermissions = jacksonObjectMapper().writeValueAsString(
        UpdateRolePermissions(
            addPermissions = listOf(
                UpdateRolePermission(
                    permission = "packet.read"
                )
            ),
            removePermissions = listOf(
                UpdateRolePermission(
                    permission = "packet.run"
                )
            )
        )
    )

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with user manage authority can create roles`() {
        val result =
            restTemplate.postForEntity(
                "/roles",
                getTokenizedHttpEntity(data = createTestRoleBody),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.CREATED)
        assertEquals(testCreateRole.name, jacksonObjectMapper().readTree(result.body).get("name").asText())
        assertEquals(
            testCreateRole.permissionNames.size,
            jacksonObjectMapper().readTree(result.body).get("rolePermissions").size()
        )
        assertNotNull(roleRepository.findByName("testRole"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot create roles`() {
        val result =
            restTemplate.postForEntity(
                "/roles",
                getTokenizedHttpEntity(data = createTestRoleBody),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `reject request if createRole body is invalid`() {
        val result =
            restTemplate.postForEntity(
                "/roles",
                getTokenizedHttpEntity(data = "{}"),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can delete roles`() {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.exchange(
                "/roles/testRole",
                HttpMethod.DELETE,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.NO_CONTENT)
        assertNull(roleRepository.findByName("testRole"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot delete roles`() {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.exchange(
                "/roles/testRole",
                HttpMethod.DELETE,
                getTokenizedHttpEntity(data = createTestRoleBody),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can update role permissions`() {
        val roleName = "testRole"
        val baseRole = roleRepository.save(Role(name = roleName))
        val permission = permissionsRepository.findByName("packet.run")!!
        baseRole.rolePermissions = mutableListOf(RolePermission(baseRole, permission))
        roleRepository.save(baseRole)

        val result = restTemplate.exchange(
            "/roles/testRole/permissions",
            HttpMethod.PUT,
            getTokenizedHttpEntity(data = updateRolePermissions),
            String::class.java
        )

        assertSuccess(result)
        val role = roleRepository.findByName("testRole")!!
        assertEquals(1, role.rolePermissions.size)
        assertEquals("packet.read", role.rolePermissions.first().permission.name)
        assertEquals(1, jacksonObjectMapper().readTree(result.body).get("rolePermissions").size())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot update role permissions`() {
        roleRepository.save(Role(name = "testRole"))

        val result = restTemplate.exchange(
            "/roles/testRole/permissions",
            HttpMethod.PUT,
            getTokenizedHttpEntity(data = updateRolePermissions),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with user manage can get all roles with relationships`() {
        val adminRole = roleRepository.findByName("ADMIN")!!
        val userRole = roleRepository.save(Role(name = "testRole", isUsername = true))
        val result =
            restTemplate.exchange(
                "/roles",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)
        val roles = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<List<RoleDto>>() {}
        )

        assert(
            roles.containsAll(
                roleService.getSortedRoleDtos(
                    listOf(
                        adminRole,
                        userRole
                    )
                )
            )
        )
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.manage"])
    fun `users with packet manage can get all roles with relationships`() {
        val result =
            restTemplate.exchange(
                "/roles",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get username roles with relationships `() {
        roleRepository.save(Role("test-username", isUsername = true))
        val result =
            restTemplate.exchange(
                "/roles?isUsername=true",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )
        val usernameRoleDtos = roleService.getSortedRoleDtos(
            roleRepository.findAllByIsUsernameOrderByName(true)
        )

        val roles = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<List<RoleDto>>() {}
        )

        assertEquals(roles.size, usernameRoleDtos.size)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get non username roles with relationships`() {
        val userRole = roleRepository.save(Role("test-user", isUsername = true)).toDto()
        val adminRole = roleRepository.findByName("ADMIN")!!.toDto()
        val result =
            restTemplate.exchange(
                "/roles?isUsername=false",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)
        val roles = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<List<RoleDto>>() {}
        )
        val foundAdminRole = roles.find { it.name == adminRole.name }!!
        assertEquals(foundAdminRole.name, adminRole.name)
        assertEquals(foundAdminRole.rolePermissions.size, adminRole.rolePermissions.size)
        assertEquals(foundAdminRole.users.size, adminRole.users.size - 1) // service user not included
        assertFalse(roles.contains(userRole))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get specific with relationships`() {
        val roleDto = roleRepository.findByName("ADMIN")!!.toDto()
        val result =
            restTemplate.exchange(
                "/roles/ADMIN",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        val roleResult = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<RoleDto>() {}
        )
        assertSuccess(result)

        assertEquals(roleDto, roleResult)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.manage"])
    fun `users with packet manage can get specific with relationships`() {
        val result =
            restTemplate.exchange(
                "/roles/ADMIN",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot update role users`() {
        val result =
            restTemplate.exchange(
                "/roles/ADMIN/users",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = "{}"),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can update role users`() {
        val testRole = roleRepository.save(Role(name = "TEST_ROLE"))
        val userToRemove = User(
            username = "test",
            disabled = false,
            userSource = "basic",
            displayName = "test user",
            roles = mutableListOf(testRole)
        )
        val userToAdd = User(
            username = "test2",
            disabled = false,
            userSource = "github",
            displayName = "test user",
        )
        userRepository.saveAll(listOf(userToRemove, userToAdd))
        val updateRoleUsers = jacksonObjectMapper().writeValueAsString(
            UpdateRoleUsers(
                usernamesToAdd = listOf(userToAdd.username),
                usernamesToRemove = listOf(userToRemove.username)
            )
        )

        val result = restTemplate.exchange(
            "/roles/${testRole.name}/users",
            HttpMethod.PUT,
            getTokenizedHttpEntity(data = updateRoleUsers),
            String::class.java
        )

        assertSuccess(result)
        assertEquals(1, jacksonObjectMapper().readTree(result.body).get("users").size())
        assertEquals(
            userToAdd.username,
            jacksonObjectMapper().readTree(result.body).get("users").first().get("username").asText()
        )
        assertEquals(1, roleRepository.findByName(testRole.name)!!.users.size)
    }
}
