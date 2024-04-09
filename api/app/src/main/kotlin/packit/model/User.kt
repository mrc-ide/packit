package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "`user`")
class User(
    val username: String,
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_group_user",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "user_group_id")]
    )
    var userGroups: MutableList<UserGroup> = mutableListOf(),
    val disabled: Boolean,
    val userSource: String,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    val displayName: String?,
    val email: String? = null,
    val password: String? = null,
    val lastLoggedIn: String? = null,
)
