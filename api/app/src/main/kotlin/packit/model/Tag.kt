package packit.model

import jakarta.persistence.*
import packit.model.dto.TagDto

@Entity
@Table(name = "tag")
class Tag(
    @Column(unique = true, nullable = false)
    val name: String,
    @ManyToMany(mappedBy = "tags")
    var packets: MutableList<Packet> = mutableListOf(),
    @OneToMany(mappedBy = "tag", cascade = [CascadeType.ALL])
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,
)

fun Tag.toDto() = TagDto(name, id!!)
