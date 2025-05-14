package packit.unit.controllers

import org.assertj.core.api.Assertions.assertThat
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.UsersController
import packit.model.User
import packit.model.toDto
import packit.service.UserService
import java.util.UUID
import kotlin.test.Test

class UsersControllerTest {
    @Test
    fun `getAllUsers returns expected results`()
    {
        val user1 = User(
            username = "test1@email.com",
            displayName = "Test ONE",
            disabled = false,
            userSource = "preauth",
            id = UUID.randomUUID()
        )
        val user2 = User(
            username = "test2@email.com",
            displayName = "Test TWO",
            disabled = false,
            userSource = "preauth",
            id = UUID.randomUUID()
        )

        val mockUserService = mock<UserService> {
            on { getAllNonServiceUsers() } doReturn listOf(user1, user2)
        }

        val sut = UsersController(mockUserService)
        val result = sut.getAllUsers()
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(result.body).isEqualTo(listOf(user1.toDto(), user2.toDto()))
    }
}