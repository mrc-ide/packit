package packit.model.dto

import org.jetbrains.annotations.NotNull

data class CreateRole(
    @field:NotNull
    val name: String,
    val permissionNames: List<String> = listOf()
)
