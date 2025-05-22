package packit.model.dto

import org.jetbrains.annotations.NotNull

data class UpdateRolePermissions(
    val addPermissions: List<UpdateRolePermission> = listOf(),
    val removePermissions: List<UpdateRolePermission> = listOf()
)

data class UpdateReadRoles(
    val roleNamesToAdd: Set<String> = setOf(),
    val roleNamesToRemove: Set<String> = setOf()
)

/**
 * @param cantRead Roles and users which have no permission to read the resource, directly or indirectly.
 * @param withRead Roles and users that have specific read permissions for the resource, which can be revoked.
 * If part of  withRead, this implies canRead.
 * @param canRead Roles that can read the resource. Users that can
 * read the resource via their own specific permissions.
 */
data class RolesAndUsersForReadUpdate(
    val cantRead: BasicRolesAndUsersDto,
    val withRead: BasicRolesAndUsersDto,
    val canRead: BasicRolesAndUsersDto,
)

class UpdateRolePermission(
    @field:NotNull
    val permission: String,
    val packetId: String? = null,
    val tagId: Int? = null,
    val packetGroupId: Int? = null
) {
    init
    {
        val nonNullFields = listOf(packetId, tagId, packetGroupId).count { it != null }
        require(nonNullFields <= 1) {
            "Either all of packetId, tagId, packetGroupId should be null or only one of them should be not null"
        }
    }
}
