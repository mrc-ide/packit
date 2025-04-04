package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "permission")
class Permission(
    @Column(unique = true, nullable = false)
    var name: String,
    var description: String,
    @OneToMany(mappedBy = "permission", cascade = [CascadeType.ALL], orphanRemoval = true)
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
