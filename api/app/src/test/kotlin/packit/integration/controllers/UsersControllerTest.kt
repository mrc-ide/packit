package packit.integration.controllers

import com.fasterxml.jackson.module.kotlin.convertValue
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
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
import packit.model.dto.UserDto
import packit.model.toDto
import packit.repository.RoleRepository
import packit.repository.UserRepository
import kotlin.test.Test
import kotlin.test.assertEquals

@TestPropertySource(properties = ["auth.method=basic"])
@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UsersControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `getAllUsers returns list of non-service users`() {
        val testRole1 = roleRepository.save(Role(name = "TEST_ROLE_1"))
        val testRole2 = roleRepository.save(Role(name = "TEST_ROLE_2"))
        val testUser1 = userRepository.save(
            User(
                username = "test_1@email.com",
                disabled = false,
                userSource = "basic",
                displayName = "test user 1",
                roles = mutableListOf(testRole1, testRole2)
            )
        )
        val testUser2 = userRepository.save(
            User(
                username = "test_2@email.com",
                disabled = false,
                userSource = "basic",
                displayName = "test user 2",
                roles = mutableListOf()
            )
        )

        val result: ResponseEntity<String> = restTemplate.exchange(
            "/users",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            String::class.java
        )
        assertSuccess(result)

        val body = jacksonObjectMapper().readTree(result.body)
        val contents: List<UserDto> = jacksonObjectMapper().convertValue(body)
        assertThat(contents).containsSequence(listOf(testUser1.toDto(), testUser2.toDto()))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["packet.read"])
    fun `user without user manage permission cannot get list of users`() {
        val result: ResponseEntity<String> = restTemplate.exchange(
            "/users",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.UNAUTHORIZED)
    }
}
