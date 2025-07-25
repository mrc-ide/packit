package packit.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import packit.model.dto.BasicPacketDto
import packit.model.dto.PacketDto

@Entity
@Table(name = "packet")
class Packet(
    @Id
    val id: String,
    val name: String,
    var displayName: String,
    @JdbcTypeCode(SqlTypes.JSON)
    val parameters: Map<String, Any>,
    val importTime: Double,
    val startTime: Double,
    val endTime: Double,
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "packet_tag",
        joinColumns = [JoinColumn(name = "packet_id")],
        inverseJoinColumns = [JoinColumn(name = "tag_id")]
    )
    var tags: MutableList<Tag> = mutableListOf(),
    @OneToMany(mappedBy = "packet", cascade = [CascadeType.ALL])
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    var description: String? = null
)

fun Packet.toDto() = PacketDto(
    id, name, displayName, parameters, importTime, startTime, endTime, description
)

fun Packet.toBasicDto() = BasicPacketDto(name, id)
