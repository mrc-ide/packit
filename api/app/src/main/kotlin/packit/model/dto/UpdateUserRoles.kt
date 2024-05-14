package packit.model.dto

data class UpdateUserRoles(
    val roleNamesToAdd: List<String> = listOf(),
    val roleNamesToRemove: List<String> = listOf()
)
