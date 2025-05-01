package packit.model.dto

import jakarta.validation.constraints.Pattern
import org.jetbrains.annotations.NotNull

data class CreateRole(
    @field:NotNull
    @field:Pattern(
        regexp = "^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$",
        message = "Name must only contain alphanumeric characters and cannot have leading or trailing spaces"
    )
    val name: String,
    val permissionNames: List<String> = listOf()
)
