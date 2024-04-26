package packit.integration.controllers

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.model.LoginWithPassword
import packit.model.LoginWithToken
import kotlin.test.assertEquals

@TestPropertySource(properties = ["auth.method=basic"])
@Sql("/set-test-users.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class LoginControllerTestBasic : IntegrationTest()
{
    @Test
    fun `returns token on successful basic login`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("admin@example.com", "password"), restTemplate)

        assertEquals(result.statusCode, HttpStatus.OK)
        Assertions.assertThat(result.body).contains("token")
    }

    @Test
    fun `returns forbidden when github login is disabled`()
    {
        val result = LoginTestHelper.getGithubLoginResponse(LoginWithToken("token"), restTemplate)
        assertForbidden(result)
    }

    @Test
    fun `returns unauthorized when user user is not found`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("notexists@example.com", "password"), restTemplate)

        assertUnauthorized(result)
    }

    @Test
    fun `returns unauthorized when password is incorrect`()
    {
        val result =
            LoginTestHelper.getBasicLoginResponse(LoginWithPassword("admin@example.com", "notcorrect"), restTemplate)

        assertUnauthorized(result)
    }
}
