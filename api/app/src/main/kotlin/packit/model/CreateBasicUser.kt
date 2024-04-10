package packit.model

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size
import org.jetbrains.annotations.NotNull
import packit.security.Role

data class CreateBasicUser(
    @field:Email(message = "Invalid email")
    val email: String,
    @field:NotNull
    val displayName: String,
    @field:Size(min = 8, message = "Password must be at least 8 characters long")
    val password: String,
    val userRoles: List<Role> = listOf(Role.USER)
)