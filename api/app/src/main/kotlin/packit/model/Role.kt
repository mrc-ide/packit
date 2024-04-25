package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "`role`")
class Role(
    var name: String,
    @OneToMany(mappedBy = "role")
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @ManyToMany(mappedBy = "roles")
    var users: MutableList<User> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)