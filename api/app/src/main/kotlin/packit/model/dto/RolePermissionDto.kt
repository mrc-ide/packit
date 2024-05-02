package packit.model.dto


data class RolePermissionDto(
    val permission: String,
    val packet: BasicPacketDto? = null,
    val tag: TagDto? = null,
    val packetGroup: PacketGroupDto? = null,
    val id: Int,
)


