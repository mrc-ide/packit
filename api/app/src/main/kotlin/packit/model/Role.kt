package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "`role`")
class Role(
    var name: String,
    @OneToMany(mappedBy = "role", fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    var isUsername: Boolean = false,
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    var users: MutableList<User> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
