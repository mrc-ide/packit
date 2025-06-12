package packit.model

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "`pin`")
class Pin(
    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @Column(name = "packet_id", nullable = false)
    var packetId: String,
)
