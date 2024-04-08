package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "`user`")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String,
    val username: String,
    val email: String,
    val displayName: String,
    @ManyToMany
    @JoinTable(
        name = "user_group_user",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "user_group_id")]
    )
    val userGroups: List<UserGroup>,
    val disabled: Boolean,
    val password: String?,
    val userSource: String?,
    val lastLoggedIn: String?,
)