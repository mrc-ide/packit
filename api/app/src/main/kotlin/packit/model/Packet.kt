package packit.model

import jakarta.persistence.*

@Entity
@Table(name = "packet")
data class Packet(
    @Id
    val id: String?= null,
    @Column(name = "name")
    val name: String?= "",
    @Column(name = "display_name", nullable = true)
    val displayName: String? ="",
    @Column(name = "parameters", nullable = true)
    val parameters: String? = null,
    @Column(name = "published")
    val published: Boolean? = false
)
