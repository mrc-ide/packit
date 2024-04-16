package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.CreateBasicUser
import kotlin.test.Test
import kotlin.test.assertTrue

@TestPropertySource(properties = ["auth.method=basic"])
@Sql("/test-users.sql")
class UserControllerTest : IntegrationTest()
{
    private val testCreateUserBody = ObjectMapper().writeValueAsString(
        CreateBasicUser(
            email = "random@email",
            password = "password",
            displayName = "Random User",
        )
    )

    @Test
    @WithAuthenticatedUser
    fun `admin user can create basic users`()
    {
        val result = restTemplate.postForEntity(
            "/user/basic",
            getTokenizedHttpEntity(data = testCreateUserBody),
            String::class.java
        )

        assertSuccess(result)
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

        assertTrue(result.statusCode.is4xxClientError)
    }
}
