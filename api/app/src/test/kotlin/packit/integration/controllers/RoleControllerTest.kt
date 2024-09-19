package packit.integration.controllers

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Role
import packit.model.RolePermission
import packit.model.User
import packit.model.dto.*
import packit.model.toDto
import packit.repository.PermissionRepository
import packit.repository.RoleRepository
import packit.repository.UserRepository
import packit.service.RoleService
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class RoleControllerTest : IntegrationTest()
{
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
    private val updateRolePermissions = UpdateRolePermissions(
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

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can create roles`()
    {
        val result =
            restTemplate.postForEntity(
                "/role",
                getTokenizedHttpEntity(data = testCreateRole),
                RoleDto::class.java
            )

        assertEquals(result.statusCode, HttpStatus.CREATED)
        assertEquals(result.body!!.name, testCreateRole.name)
        assertEquals(result.body!!.rolePermissions.size, testCreateRole.permissionNames.size)

        assertNotNull(roleRepository.findByName("testRole"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot create roles`()
    {
        val result =
            restTemplate.postForEntity(
                "/role",
                getTokenizedHttpEntity(data = testCreateRole),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `reject request if createRole body is invalid`()
    {
        val result =
            restTemplate.postForEntity(
                "/role",
                getTokenizedHttpEntity(data = "{}"),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can delete roles`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.exchange(
                "/role/testRole",
                HttpMethod.DELETE,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.NO_CONTENT)
        assertNull(roleRepository.findByName("testRole"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot delete roles`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.postForEntity(
                "/role/testRole",
                getTokenizedHttpEntity(data = testCreateRole),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can update role permissions`()
    {
        val roleName = "testRole"
        val baseRole = roleRepository.save(Role(name = roleName))
        val permission = permissionsRepository.findByName("packet.run")!!
        baseRole.rolePermissions = mutableListOf(RolePermission(baseRole, permission))
        roleRepository.save(baseRole)

        val result = restTemplate.exchange(
            "/role/testRole/permissions",
            HttpMethod.PUT,
            getTokenizedHttpEntity(data = updateRolePermissions),
            RoleDto::class.java
        )

        val body = assertSuccess(result)
        assertEquals(body.rolePermissions.map { it.permission }, listOf("packet.read"))

        val role = roleRepository.findByName("testRole")!!
        assertEquals(role.rolePermissions.map { it.permission.name }, listOf("packet.read"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot update role permissions`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result = restTemplate.exchange(
            "/role/testRole/permissions",
            HttpMethod.PUT,
            getTokenizedHttpEntity(data = updateRolePermissions),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `user with manage authority can read roles`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result = restTemplate.exchange(
            "/role",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            object : ParameterizedTypeReference<List<RoleDto>>() {}
        )

        val body = assertSuccess(result)
        assertTrue(body.map { it.name }.containsAll(listOf("ADMIN", "testRole")))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get all non username roles`()
    {
        roleRepository.save(Role(name = "testRole", isUsername = true))
        val result =
            restTemplate.exchange(
                "/role",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                object : ParameterizedTypeReference<List<RoleDto>>() {}
            )

        val body = assertSuccess(result)

        assertEquals(body.map { it.name }, listOf("ADMIN"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get specific role`()
    {
        val roleDto = roleRepository.findByName("ADMIN")!!.toDto()
        val result =
            restTemplate.exchange(
                "/role/ADMIN",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                RoleDto::class.java
            )

        val body = assertSuccess(result)
        assertEquals(roleDto, body)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot update role users`()
    {
        val result =
            restTemplate.exchange(
                "/role/ADMIN/users",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = "{}"),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can update role users`()
    {
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

        val result = restTemplate.exchange(
            "/role/${testRole.name}/users",
            HttpMethod.PUT,
            getTokenizedHttpEntity(
                data = UpdateRoleUsers(
                usernamesToAdd = listOf(userToAdd.username),
                usernamesToRemove = listOf(userToRemove.username)
            )
            ),
            RoleDto::class.java
        )

        val body = assertSuccess(result)
        assertEquals(1, body.users.size)
        assertEquals(userToAdd.username, body.users.first().username)
        assertEquals(1, roleRepository.findByName(testRole.name)!!.users.size)
    }
}
