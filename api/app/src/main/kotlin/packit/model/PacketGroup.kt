package packit.model

import jakarta.persistence.*
import packit.model.dto.PacketGroupDto

@Entity
@Table(name = "packet_group")
class PacketGroup(
    var name: String,
    @OneToMany(mappedBy = "packetGroup", cascade = [CascadeType.ALL])
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null
)

fun PacketGroup.toDto() = PacketGroupDto(name, id!!)
