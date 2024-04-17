package packit.model

import jakarta.persistence.*
import packit.security.Role

@Entity
@Table(name = "user_group")
class UserGroup(
    @Enumerated(EnumType.STRING)
    val role: Role,
    @ManyToMany(mappedBy = "userGroups")
    var users: MutableList<User> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null
)
