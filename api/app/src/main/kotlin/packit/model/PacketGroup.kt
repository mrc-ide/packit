package packit.model

import jakarta.persistence.*
import packit.model.dto.PacketGroupDto

@Entity
@Table(name = "packet_group")
class PacketGroup(
    var name: String,
    @OneToMany(mappedBy = "packetGroup", cascade = [CascadeType.ALL])
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @OneToMany(mappedBy = "taskId", cascade = [CascadeType.ALL])
    var runInfos: MutableList<RunInfo> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null
)

fun PacketGroup.toDto() = PacketGroupDto(name, id!!)
