package packit.model

import jakarta.persistence.*
import packit.model.dto.OneTimeTokenDto
import java.time.Instant
import java.util.*

@Entity
@Table(name = "one_time_token")
class OneTimeToken(
    @Id // Omit @GeneratedValue annotation so that we can control the function used to generate UUIDs
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
