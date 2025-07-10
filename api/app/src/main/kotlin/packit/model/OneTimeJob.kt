package packit.model

import jakarta.persistence.*


@Entity
@Table(name = "one_time_job")
class OneTimeJob(
    @Column(nullable = false, unique = true)
    val name: String,
    @Column(nullable = false)
    var status: String,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,
    @Column(nullable = true)
    var error: String? = null,
)

enum class OneTimeJobStatus {
    NOT_STARTED,
    STARTED,
    COMPLETED,
    FAILED
}