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
import packit.model.Role
import packit.model.RolePermission
import packit.model.User
import packit.model.dto.RolesAndUsersWithPermissionsDto
import packit.repository.PermissionRepository
import packit.repository.RoleRepository
import packit.repository.UserRepository
import kotlin.test.assertEquals

@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UserRoleControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    @Autowired
    private lateinit var permissionRepository: PermissionRepository

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `getRolesAndUsers user without user manage permission cannot get`() {
        val result =
            restTemplate.exchange(
                "/user-role",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `getRolesAndUsers user with permissions gets correct response`() {
        val runPermission = permissionRepository.findByName("packet.run")!!
        val testRoles = roleRepository.saveAll(
            listOf(
                Role("testRole1"),
                Role("testRole2"),
                Role("test1@gmail.com", isUsername = true)
            )
        )
        testRoles.forEach {
            it.rolePermissions = mutableListOf(RolePermission(it, runPermission))
            roleRepository.save(it)
        }
        val testUser = userRepository.save(
            User(
                username = "test1@gmail.com",
                disabled = false,
                userSource = "github",
                displayName = "test user",
                roles = testRoles.subList(1, testRoles.size) // testRole2 + user role
            )

        )
        val result =
            restTemplate.exchange(
                "/user-role",
                HttpMethod.GET,
                getTokenizedHttpEntity(),
                String::class.java
            )

        assertSuccess(result)

        val userAndRoles = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<RolesAndUsersWithPermissionsDto>() {}
        )

        val roles = userAndRoles.roles.filter { it.name == "testRole1" || it.name == "testRole2" }
        val user = userAndRoles.users.find { it.username == testUser.username }!!

        assertEquals(roles.size, 2)
        assertEquals(roles[0].name, "testRole1")
        assertEquals(roles[1].name, "testRole2")
        assertEquals(user.username, "test1@gmail.com")
        assertEquals(user.specificPermissions.size, 1)
        assertEquals(user.specificPermissions[0].permission, runPermission.name)
        assertEquals(user.roles.size, 1)
    }
}
