package packit.service

import org.springframework.stereotype.Service
import packit.model.User
import packit.security.Role
import java.util.*

interface UserService
{
    fun findByEmail(email: String): Optional<User>
}

@Service
class UserServiceImpl : UserService
{
    companion object
    {
        const val USER = "test.user@example.com"
        const val PASSWORD = "$2a$12$676UJYz9Geh5Ki1jPMwMg.kI6HcYw94uWRs39mEWZbOP8KDx0gOHu"
    }

    override fun findByEmail(email: String): Optional<User>
    {
        if (!USER.equals(email, ignoreCase = true))
        {
            return Optional.empty()
        }

        return Optional.of(
            User(
                1L,
                USER,
                PASSWORD,
                Role.USER
            )
        )
    }
}
