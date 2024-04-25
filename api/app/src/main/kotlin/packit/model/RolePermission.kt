package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "role_permission")
class RolePermission(
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    var role: Role,

    @ManyToOne
    @JoinColumn(name = "permission_id", nullable = false)
    var permission: Permission,

    @ManyToOne
    @JoinColumn(name = "packet_id")
    var packet: Packet? = null,

    @ManyToOne
    @JoinColumn(name = "packet_group_id")
    var packetGroup: PacketGroup? = null,

    @ManyToOne
    @JoinColumn(name = "tag_id")
    var tag: Tag? = null,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
