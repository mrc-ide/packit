package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "tag")
class Tag(
    val name: String,
    @ManyToMany(mappedBy = "tags")
    var packets: MutableList<Packet> = mutableListOf(),
    @OneToMany(mappedBy = "tag", cascade = [CascadeType.ALL])
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,
)
