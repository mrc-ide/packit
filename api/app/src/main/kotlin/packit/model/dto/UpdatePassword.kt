package packit.model.dto

import jakarta.validation.constraints.Size

data class UpdatePassword(
    @field:Size(min = 8, message = "Password must be at least 8 characters long")
    val currentPassword: String,
    @field:Size(min = 8, message = "Password must be at least 8 characters long")
    val newPassword: String
)
{
    init
    {
        require(currentPassword != newPassword) { "New password must be different from the current password" }
    }
}
