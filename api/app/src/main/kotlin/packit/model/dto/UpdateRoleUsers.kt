package packit.model.dto

data class UpdateRoleUsers(
    val usernamesToAdd: List<String> = listOf(),
    val usernamesToRemove: List<String> = listOf()
)
