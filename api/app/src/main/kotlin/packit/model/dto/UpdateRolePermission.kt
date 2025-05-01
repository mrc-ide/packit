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

// TODO: only need name and id really!!! not full dtos (basic dtos should suffice)
data class RolesAndUsersToUpdateRead(
    val cantRead: RolesAndUsersWithPermissionsDto,
    val withRead: RolesAndUsersWithPermissionsDto
)

// can combine both usersandroles can read
data class RolesAndUsersForPacketReadUpdate(
    val cantRead: RolesAndUsersWithPermissionsDto,
    val withRead: RolesAndUsersWithPermissionsDto,
    val canRead: RolesAndUsersWithPermissionsDto,
)

class UpdateRolePermission(
    @field:NotNull
    val permission: String,
    val packetId: String? = null,
    val tagId: Int? = null,
    val packetGroupId: Int? = null
)
{
    init
    {
        val nonNullFields = listOf(packetId, tagId, packetGroupId).count { it != null }
        require(nonNullFields <= 1) {
            "Either all of packetId, tagId, packetGroupId should be null or only one of them should be not null"
        }
    }
}
