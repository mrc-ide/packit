package packit.integration.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.test.context.jdbc.Sql
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.dto.CreateRole
import packit.repository.RoleRepository
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@Sql("/delete-test-users.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class RoleControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var roleRepository: RoleRepository
    private val createTestRoleBody = ObjectMapper().writeValueAsString(
        CreateRole(
            name = "testRole",
            permissions = listOf("packet.run", "packet.read")
        )
    )

    @Test
    @WithAuthenticatedUser(authorities = ["user.manage"])
    fun `users with manage authority can create roles`()
    {
        val result = restTemplate.postForEntity(
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
        val result = restTemplate.postForEntity(
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
        val result = restTemplate.postForEntity(
            "/role",
            getTokenizedHttpEntity(data = "{}"),
            String::class.java
        )

        assertEquals(result.statusCode, HttpStatus.BAD_REQUEST)
    }
}
