package packit.model

import jakarta.persistence.*
import packit.model.dto.BasicUserDto
import packit.model.dto.UserDto
import java.time.Instant
import java.util.*

@Entity
@Table(name = "`user`")
class User(
    val username: String,
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_role",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "role_id")]
    )
    var roles: MutableList<Role> = mutableListOf(),
    var disabled: Boolean,
    val userSource: String,
    val displayName: String?,
    val email: String? = null,
    val password: String? = null,
    var lastLoggedIn: Instant? = null,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
)

fun User.toBasicDto() = BasicUserDto(username, id!!)

fun User.toDto() =
    UserDto(username, roles.map { it.toBasicDto() }, disabled, userSource, displayName, email, id!!)
