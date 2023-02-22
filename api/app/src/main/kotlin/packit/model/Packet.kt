package packit.model

import jakarta.persistence.*

@Entity
@Table(name= "packet")
data class Packet(
    @Id
    var id: String,
    @Column(name = "name")
    var name: String,
    @Column(name = "display_name")
    var displayName: String,
    @Column(name = "parameters")
    var parameters: String,
    @Column(name = "published")
    var published: Boolean
)
