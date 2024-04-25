package packit.model

import jakarta.persistence.*
import packit.helpers.JsonMapConverter

@Entity
@Table(name = "packet")
data class Packet(
    @Id
    val id: String,
    val name: String,
    val displayName: String,
    @Convert(converter = JsonMapConverter::class)
    val parameters: Map<String, Any>,
    val published: Boolean,
    val importTime: Double,
    val startTime: Double,
    val endTime: Double,
    @ManyToMany
    @JoinTable(
        name = "packet_tag",
        joinColumns = [JoinColumn(name = "packet_id")],
        inverseJoinColumns = [JoinColumn(name = "tag_id")]
    )
    var tags: MutableList<Tag> = mutableListOf(),

    @OneToMany(mappedBy = "packet")
    var rolePermissions: MutableList<RolePermission> = mutableListOf()
)
