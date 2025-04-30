package packit.model

import jakarta.persistence.*
import packit.model.dto.OneTimeTokenDto
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "one_time_token")
class OneTimeToken(
    @Id // Omit @GeneratedValue annotation so that we can control the function used to generate UUIDs
    var id: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packet_id", nullable = false)
    var packet: Packet,

    @Column(name = "file_paths", columnDefinition = "TEXT[]")
    var filePaths: List<String>,

    @Column(name = "expires_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var expiresAt: Instant
)

fun OneTimeToken.toDto() = OneTimeTokenDto(id)
