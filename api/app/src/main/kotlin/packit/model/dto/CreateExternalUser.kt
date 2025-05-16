package packit.model.dto

import jakarta.validation.constraints.Email
import org.jetbrains.annotations.NotNull

data class CreateExternalUser(
    @field:NotNull
    val username: String,
    @field:Email(message = "Invalid email")
    val email: String?,
    val displayName: String?,
    val userRoles: List<String> = listOf()
)
