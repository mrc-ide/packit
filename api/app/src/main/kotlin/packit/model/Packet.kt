package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "packet")
data class Packet(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long? = -1,
    @Column(name = "name", unique = true, nullable = false)
    val name: String?= "",
    @Column(name = "display_name", nullable = false)
    val displayName: String? ="",
    @Column(name = "parameters", nullable = true)
    val parameters: String? = null,
    @Column(name = "published", nullable = true)
    val published: Boolean? = false
)
