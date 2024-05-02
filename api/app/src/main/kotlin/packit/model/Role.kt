package packit.model

import jakarta.persistence.*
import packit.model.dto.RoleDto

@Entity
@Table(name = "`role`")
class Role(
    var name: String,
    @OneToMany(mappedBy = "role", fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    var rolePermissions: MutableList<RolePermission> = mutableListOf(),
    @ManyToMany(mappedBy = "roles", fetch = FetchType.EAGER)
    var users: MutableList<User> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)

fun Role.toDto() =
    RoleDto(
        name, rolePermissions.map { it.toDto() }, users.map { it.toDto() }, id!!
    )
