package packit.model

import jakarta.persistence.*
import org.hibernate.annotations.Filter
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
    var disabled: Boolean = false,
    val userSource: String,
    val displayName: String? = null,
    val email: String? = null,
    var password: String? = null,
    var lastLoggedIn: Instant? = null,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,
    @OneToMany(mappedBy = "user")
    var runInfos: MutableList<RunInfo> = mutableListOf(),

    @OneToOne()
    @JoinColumn(
        name = "username",
        referencedColumnName = "name",
        insertable = false,
        updatable = false
    )
    @Filter(name = "isUsername", condition = "isUsername = TRUE")
    var userRole: Role? = null,
)

fun User.toBasicDto() = BasicUserDto(username, id!!)

fun User.toDto() =
    UserDto(
        username,
        roles.toBasicDto(),
        disabled,
        userSource,
        displayName,
        email,
        id!!,
        userRole?.rolePermissions?.map { it.toDto() } ?: listOf()
    )

fun List<User>.toDto() = sortedBy { it.username }.map { it.toDto() }
fun List<User>.toBasicDto() = sortedBy { it.username }.map { it.toBasicDto() }
