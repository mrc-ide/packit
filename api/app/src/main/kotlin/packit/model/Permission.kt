package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "permission")
class Permission(
    var name: String,
    var description: String,
    @OneToMany(mappedBy = "permission")
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
