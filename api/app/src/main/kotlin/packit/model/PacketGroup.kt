package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "packet_group")
class PacketGroup(
    var name: String,
    @OneToMany(mappedBy = "packetGroup")
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null
)
