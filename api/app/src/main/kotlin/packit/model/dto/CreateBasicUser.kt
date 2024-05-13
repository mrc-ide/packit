package packit.model.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size
import org.jetbrains.annotations.NotNull

data class CreateBasicUser(
    @field:Email(message = "Invalid email")
    val email: String,
    @field:NotNull
    val displayName: String,
    @field:Size(min = 8, message = "Password must be at least 8 characters long")
    val password: String,
    val userRoles: List<String> = listOf()
)
