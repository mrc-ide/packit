package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Role
import packit.model.User
import packit.model.dto.CreateBasicUser
import packit.model.dto.CreateExternalUser
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

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `cannot create external user when auth method is basic`()
    {
        val testCreateExternalUser = CreateExternalUser(
            username = "test.user",
            email = "test@email",
            displayName = "PreAuth User",
            userRoles = listOf()
        )

        val testCreateExternalUserBody = jacksonObjectMapper().writeValueAsString(testCreateExternalUser)
        val result = restTemplate.postForEntity(
            "/user/external",
            getTokenizedHttpEntity(data = testCreateExternalUserBody),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.FORBIDDEN)
    }
}

@TestPropertySource(properties = ["auth.method=preauth"])
@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UserControllerPreauthTest: IntegrationTest()
{
    @Autowired
    lateinit var userRepository: UserRepository

    private val testCreateExternalUser = CreateExternalUser(
        username = "test.user",
        email = "test@email",
        displayName = "PreAuth User",
        userRoles = listOf("ADMIN")
    )

    private val testCreateExternalUserBody = jacksonObjectMapper().writeValueAsString(testCreateExternalUser)

    private fun getResult(): ResponseEntity<String>
    {
        return restTemplate.postForEntity(
            "/user/external",
            getTokenizedHttpEntity(data = testCreateExternalUserBody),
            String::class.java
        )
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can create external users`()
    {
        val result = getResult()

        val userResult = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<UserDto>()
            {}
        )
        assertEquals(HttpStatus.CREATED, result.statusCode)
        assertEquals(testCreateExternalUser.username, userResult.username)
        assertEquals(testCreateExternalUser.email, userResult.email)
        assertEquals(testCreateExternalUser.displayName, userResult.displayName)
        assertEquals("preauth", userResult.userSource)
        assertEquals(false, userResult.disabled)
        assertEquals(2, userResult.roles.size)
        assertEquals("ADMIN", userResult.roles[0].name)
        assertEquals(testCreateExternalUser.username, userResult.roles[1].name)
        assertNotNull(userRepository.findByUsername(testCreateExternalUser.username))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `user without user manage permission cannot create external users`()
    {
        val result = getResult()

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `400 returned if attempt to create external user that already exists`() {
        val firstResult = getResult()
        assertEquals(HttpStatus.CREATED, firstResult.statusCode)

        val secondResult = getResult()
        assertEquals(HttpStatus.BAD_REQUEST, secondResult.statusCode)
    }


    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `create external user fails if email is not valid`()
    {
        val badEmailUser = CreateExternalUser(
            username = "test.bad.user",
            email = "not an email",
            displayName = "PreAuth User",
            userRoles = listOf()
        )
        val body = jacksonObjectMapper().writeValueAsString(badEmailUser)

        val result = restTemplate.postForEntity(
            "/user/external",
            getTokenizedHttpEntity(data = body),
            String::class.java
        )
        assertEquals(HttpStatus.BAD_REQUEST, result.statusCode)
    }

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `email and display name are optional when creating external user`()
    {
        val minimallUser = CreateExternalUser(
            username = "test.minimal.user",
            email = null,
            displayName = null,
            userRoles = listOf()
        )
        val body = jacksonObjectMapper().writeValueAsString(minimallUser)

        val result = restTemplate.postForEntity(
            "/user/external",
            getTokenizedHttpEntity(data = body),
            String::class.java
        )
        val userResult = jacksonObjectMapper().readValue(
            result.body,
            object : TypeReference<UserDto>()
            {}
        )
        assertEquals(HttpStatus.CREATED, result.statusCode)
        assertEquals("test.minimal.user", userResult.username)
        assertEquals(null, userResult.email)
        assertEquals(null, userResult.displayName)
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
