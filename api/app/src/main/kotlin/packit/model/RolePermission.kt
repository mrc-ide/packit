package packit.model

import jakarta.persistence.*
import packit.model.dto.RolePermissionDto

@Entity
@Table(name = "role_permission")
class RolePermission(
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    var role: Role,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "permission_id", nullable = false)
    var permission: Permission,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "packet_id")
    var packet: Packet? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "packet_group_id")
    var packetGroup: PacketGroup? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tag_id")
    var tag: Tag? = null,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
{
    init
    {
        val nonNullFields = listOf(packet, tag, packetGroup).count { it != null }
        require(nonNullFields <= 1) {
            "Either all of packet, tag, packetGroup should be null or only one of them should be not null"
        }
    }

    override fun equals(other: Any?): Boolean
    {
        return when
        {
            this === other -> true
            other !is RolePermission -> false
            role.name != other.role.name -> false
            permission.name != other.permission.name -> false
            packet?.id != other.packet?.id -> false
            packetGroup?.id != other.packetGroup?.id -> false
            tag?.id != other.tag?.id -> false
            else -> true
        }
    }

    override fun hashCode(): Int
    {
        val prime = 31
        var result = role.name.hashCode()
        result = prime * result + permission.name.hashCode()
        result = prime * result + packet?.id.hashCode()
        result = prime * result + packetGroup?.id.hashCode()
        result = prime * result + tag?.id.hashCode()
        return result
    }
}

fun RolePermission.toDto() = RolePermissionDto(
    permission.name,
    packet?.toBasicDto(),
    tag?.toDto(),
    packetGroup?.toDto(),
    id!!
)