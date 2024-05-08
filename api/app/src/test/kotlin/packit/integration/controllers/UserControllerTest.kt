package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Role
import packit.model.User
import packit.model.dto.CreateBasicUser
import packit.model.dto.UpdateUserRoles
import packit.repository.RoleRepository
import packit.repository.UserRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@TestPropertySource(properties = ["auth.method=basic"])
@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UserControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var roleRepository: RoleRepository

    @Autowired
    lateinit var userRepository: UserRepository

    private val testCreateUser = CreateBasicUser(
        email = "random@email",
        password = "password",
        displayName = "Random User",
    )
    private val testCreateUserBody = ObjectMapper().writeValueAsString(testCreateUser)

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can create basic users`()
    {
        val result = restTemplate.postForEntity(
            "/user/basic",
            getTokenizedHttpEntity(data = testCreateUserBody),
            String::class.java
        )

        assertEquals(HttpStatus.CREATED, result.statusCode)
        assertEquals(testCreateUser.email, ObjectMapper().readTree(result.body).get("username").asText())
        assertEquals(testCreateUser.displayName, ObjectMapper().readTree(result.body).get("displayName").asText())
        assertNotNull(userRepository.findByUsername("random@email"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `user without user manage permission cannot create basic users`()
    {
        val result = restTemplate.postForEntity(
            "/user/basic",
            getTokenizedHttpEntity(data = testCreateUserBody),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser
    fun `reject request if createUser body is invalid`()
    {
        val invalidEmailAndPasswordBody = ObjectMapper().writeValueAsString(
            CreateBasicUser(
                email = "random",
                password = "pp",
                displayName = "Random User",
            )
        )
        val result = restTemplate.postForEntity(
            "/user/basic",
            getTokenizedHttpEntity(data = invalidEmailAndPasswordBody),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `updateUserRoles can add and remove roles from users`()
    {
        val testRole = roleRepository.save(Role(name = "TEST_ROLE"))
        val testUser = userRepository.save(
            User(
                username = "test",
                disabled = false,
                userSource = "basic",
                displayName = "test user",
                roles = mutableListOf(testRole)
            )
        )
        val updateUserRolesJSON = ObjectMapper().writeValueAsString(
            UpdateUserRoles(
                roleNamesToAdd = listOf("ADMIN"),
                roleNamesToRemove = listOf(testRole.name)
            )
        )

        val result = restTemplate.exchange(
            "/user/update-roles/${testUser.username}",
            HttpMethod.PUT,
            getTokenizedHttpEntity(data = updateUserRolesJSON),
            String::class.java
        )

        assertSuccess(result)
        assertEquals(userRepository.findByUsername("test")?.roles?.map { it.name }, listOf("ADMIN"))
        assertEquals(testUser.username, ObjectMapper().readTree(result.body).get("username").asText())
        assertEquals(testUser.displayName, ObjectMapper().readTree(result.body).get("displayName").asText())
        assertEquals(1, ObjectMapper().readTree(result.body).get("roles").size())
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `deleteUser deletes user and username role`()
    {
        val username = "testUsername"
        val testRole = roleRepository.save(Role(name = username))
        val testUser = userRepository.save(
            User(
                username = username,
                disabled = false,
                userSource = "basic",
                displayName = "test user",
                roles = mutableListOf(testRole)
            )
        )

        val result = restTemplate.exchange(
            "/user/$username",
            HttpMethod.DELETE,
            getTokenizedHttpEntity(),
            String::class.java
        )

        assertEquals(HttpStatus.NO_CONTENT, result.statusCode)
        assertEquals(userRepository.findByUsername(testUser.username), null)
        assertEquals(roleRepository.findByName(username), null)
    }
}
