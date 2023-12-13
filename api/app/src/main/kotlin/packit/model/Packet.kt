package packit.model

import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.Id
import packit.helpers.JsonMapConverter

@Entity
data class Packet(
    @Id
    val id: String,
    val name: String,
    val displayName: String,
    @Convert(converter = JsonMapConverter::class)
    val parameters: Map<String, Any>,
    val published: Boolean,
    val importTime: Long,
    val startTime: Double,
    val endTime: Double
)
