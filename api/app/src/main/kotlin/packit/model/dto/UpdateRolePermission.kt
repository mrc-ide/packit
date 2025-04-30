package packit.model.dto

import org.jetbrains.annotations.NotNull

data class UpdateRolePermissions(
    val addPermissions: List<UpdateRolePermission> = listOf(),
    val removePermissions: List<UpdateRolePermission> = listOf()
)

open class UpdateReadRoles(
    open val roleNamesToAdd: Set<String> = setOf(),
    open val roleNamesToRemove: Set<String> = setOf()
)

data class UpdatePacketReadRoles(
    val packetGroupName: String,
    override val roleNamesToAdd: Set<String> = setOf(),
    override val roleNamesToRemove: Set<String> = setOf()
) : UpdateReadRoles(roleNamesToAdd, roleNamesToRemove)


data class RolesAndUsersToUpdateRead(
    val cantRead: RolesAndUsersWithPermissionsDto,
    val withRead: RolesAndUsersWithPermissionsDto
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
