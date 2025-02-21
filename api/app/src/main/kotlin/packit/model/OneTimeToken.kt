package packit.model

import jakarta.persistence.*
import packit.model.dto.OneTimeTokenDto
import packit.model.dto.PacketDto
import java.time.Instant
import java.util.*

@Entity
@Table(name = "one_time_token")
class OneTimeToken(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packet_id", nullable = false)
    var packet: Packet,

    @Column(name = "file_paths", columnDefinition = "TEXT[]")
    @Convert(converter = StringListConverter::class)
    var filePaths: List<String>,

    var expiresAt: Instant
)

fun OneTimeToken.toDto() = OneTimeTokenDto(id)
