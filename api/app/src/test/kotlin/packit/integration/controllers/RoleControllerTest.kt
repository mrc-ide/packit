package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Role
import packit.model.RolePermission
import packit.model.dto.CreateRole
import packit.model.dto.UpdateRolePermission
import packit.model.toDto
import packit.repository.PermissionRepository
import packit.repository.RoleRepository
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class RoleControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var roleRepository: RoleRepository

    @Autowired
    private lateinit var permissionsRepository: PermissionRepository

    private val createTestRoleBody =
        ObjectMapper()
            .writeValueAsString(
                CreateRole(
                    name = "testRole",
                    permissionNames = listOf("packet.run", "packet.read")
                )
            )
    private val updateRolePermission =
        ObjectMapper()
            .writeValueAsString(listOf(UpdateRolePermission(permission = "packet.run")))

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can create roles`()
    {
        val result =
            restTemplate.postForEntity(
                "/role",
                getTokenizedHttpEntity(data = createTestRoleBody),
                String::class.java
            )

        assertSuccess(result)
        assertNotNull(roleRepository.findByName("testRole"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot create roles`()
    {
        val result =
            restTemplate.postForEntity(
                "/role",
                getTokenizedHttpEntity(data = createTestRoleBody),
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
                getTokenizedHttpEntity(data = createTestRoleBody),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can add permissions to roles`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.exchange(
                "/role/add-permissions/testRole",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updateRolePermission),
                String::class.java
            )

        assertSuccess(result)
        val role = roleRepository.findByName("testRole")!!
        assertEquals(1, role.rolePermissions.size)
        assertEquals("packet.run", role.rolePermissions.first().permission.name)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can remove permissions from roles`()
    {
        val roleName = "testRole"
        val baseRole = roleRepository.save(Role(name = roleName))
        val permission = permissionsRepository.findByName("packet.run")!!
        baseRole.rolePermissions = mutableListOf(RolePermission(baseRole, permission))
        roleRepository.save(baseRole)

        val result =
            restTemplate.exchange(
                "/role/remove-permissions/testRole",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updateRolePermission),
                String::class.java
            )

        assertSuccess(result)
        val role = roleRepository.findByName("testRole")!!
        assertEquals(0, role.rolePermissions.size)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot remove roles from permissions`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.exchange(
                "/role/remove-permissions/testRole",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updateRolePermission),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot add roles to permissions`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.exchange(
                "/role/add-permissions/testRole",
                HttpMethod.PUT,
                getTokenizedHttpEntity(data = updateRolePermission),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `user with manage authority can read role names`()
    {
        roleRepository.save(Role(name = "testRole"))

        val result =
            restTemplate.exchange(
                "/role/names",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)

        assertEquals(ObjectMapper().writeValueAsString(listOf("ADMIN", "testRole")), result.body)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get roles with relationships`()
    {
        val roleDto = roleRepository.findByName("ADMIN")!!.toDto()
        val result =
            restTemplate.exchange(
                "/role",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)

        assertEquals(ObjectMapper().writeValueAsString(listOf(roleDto)), result.body)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get username roles with relationships `()
    {
        roleRepository.save(Role("username", isUsername = true))
        val allUsernameRoles = roleRepository.findAllByIsUsername(true).map { it.toDto() }
        val result =
            restTemplate.exchange(
                "/role?isUsername=true",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)

        assertEquals(ObjectMapper().writeValueAsString(allUsernameRoles), result.body)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get non username roles with relationships`()
    {
        roleRepository.save(Role("randomUser", isUsername = true)).toDto()
        val adminRole = roleRepository.findByName("ADMIN")!!.toDto()
        val result =
            restTemplate.exchange(
                "/role?isUsername=false",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)

        assertEquals(ObjectMapper().writeValueAsString(listOf(adminRole)), result.body)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users can get specific with relationships`()
    {
        val roleDto = roleRepository.findByName("ADMIN")!!.toDto()
        val result =
            restTemplate.exchange(
                "/role/ADMIN",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)

        assertEquals(ObjectMapper().writeValueAsString(roleDto), result.body)
    }
}
