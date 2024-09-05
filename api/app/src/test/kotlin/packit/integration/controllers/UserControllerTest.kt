package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
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
import packit.model.dto.UserDto
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
        email = "test@email",
        password = "password",
        displayName = "Random User",
    )
    private val testCreateUserBody = jacksonObjectMapper().writeValueAsString(testCreateUser)

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can create basic users`()
    {
        val result = restTemplate.postForEntity(
            "/user/basic",
            getTokenizedHttpEntity(data = testCreateUserBody),
            String::class.java
        )

        val userResult = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<UserDto>()
            {}
        )
        assertEquals(HttpStatus.CREATED, result.statusCode)
        assertEquals(testCreateUser.email, userResult.email)
        assertEquals(testCreateUser.displayName, userResult.displayName)
        assertNotNull(userRepository.findByUsername(testCreateUser.email))
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
        val invalidEmailAndPasswordBody = jacksonObjectMapper().writeValueAsString(
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
                username = "test@email.com",
                disabled = false,
                userSource = "basic",
                displayName = "test user",
                roles = mutableListOf(testRole)
            )
        )
        val updateUserRolesJSON = jacksonObjectMapper().writeValueAsString(
            UpdateUserRoles(
                roleNamesToAdd = listOf("ADMIN"),
                roleNamesToRemove = listOf(testRole.name)
            )
        )

        val result = restTemplate.exchange(
            "/user/${testUser.username}/roles",
            HttpMethod.PUT,
            getTokenizedHttpEntity(data = updateUserRolesJSON),
            String::class.java
        )

        val userResult = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<UserDto>()
            {}
        )
        assertSuccess(result)
        assertEquals(userRepository.findByUsername("test@email.com")?.roles?.map { it.name }, listOf("ADMIN"))
        assertEquals(testUser.username, userResult.username)
        assertEquals(testUser.displayName, userResult.displayName)
        assertEquals(1, userResult.roles.size)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `deleteUser deletes user and username role`()
    {
        val username = "test@email.com"
        val testRole = roleRepository.save(Role(name = username, isUsername = true))
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

@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@TestPropertySource(
    properties = [
    "auth.method=basic",
    "packit.defaultRoles=TEST_USER_ROLE,TEST_MISSING_ROLE"
]
)
class UserControllerDefaultRolesTest : IntegrationTest()
{
    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var roleRepository: RoleRepository

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `user is created with default roles`()
    {
        roleRepository.save(Role(name = "TEST_USER_ROLE"))
        roleRepository.save(Role(name = "TEST_AUTHOR_ROLE"))

        val result = restTemplate.postForEntity(
            "/user/basic",
            getTokenizedHttpEntity(
                data = CreateBasicUser(
                email = "test@email",
                password = "password",
                displayName = "Random User",
            )
            ),
            UserDto::class.java
        )
        assertEquals(result.statusCode, HttpStatus.CREATED)
        assertEquals(result.body?.username, "test@email")
        assertEquals(
            result.body?.roles?.map { it.name },
            listOf("TEST_USER_ROLE", "test@email")
        )
    }
}
