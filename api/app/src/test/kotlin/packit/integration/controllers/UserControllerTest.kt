package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.dto.CreateBasicUser
import packit.repository.UserRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@TestPropertySource(properties = ["auth.method=basic"])
@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UserControllerTest : IntegrationTest()
{
    @Autowired
    lateinit var userRepository: UserRepository

    private val testCreateUserBody = ObjectMapper().writeValueAsString(
        CreateBasicUser(
            email = "random@email",
            password = "password",
            displayName = "Random User",
        )
    )

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can create basic users`()
    {
        val result = restTemplate.postForEntity(
            "/user/basic/create",
            getTokenizedHttpEntity(data = testCreateUserBody),
            String::class.java
        )

        assertSuccess(result)
        assertNotNull(userRepository.findByUsername("random@email"))
    }

    @Test
    @WithAuthenticatedUser(authorities = ["none"])
    fun `non-admin user cannot create basic users`()
    {
        val result = restTemplate.postForEntity(
            "/user/basic/create",
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
            "/user/basic/create",
            getTokenizedHttpEntity(data = invalidEmailAndPasswordBody),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
    }
}
